"""
Cybercrime Guidance Chat Engine using LangChain + ChromaDB.
Handles crime classification, step-by-step guidance, evidence collection,
legal reference, authority referral, and psychological support.
"""

import os
from typing import Optional, List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.vectorstores import ChromaDB
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain

from knowledge_base import SYSTEM_PROMPT, CHILD_SAFETY_PROMPT, CRIME_TYPES


class CybercrimeChatEngine:
    """LangChain-powered chat engine for cybercrime guidance."""

    def __init__(self):
        self.llm = self._init_llm()
        self.vectorstore = self._init_vectorstore()
        self.crime_types = list(CRIME_TYPES.keys())

    def _init_llm(self) -> ChatGoogleGenerativeAI:
        """Initialize the LLM (Google Gemini via LangChain)."""
        api_key = os.environ.get("GOOGLE_API_KEY", "")
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-pro",
            google_api_key=api_key,
            temperature=0.3,
            max_output_tokens=2048,
        )

    def _init_vectorstore(self) -> Optional[ChromaDB]:
        """Initialize ChromaDB vector store with PECA 2016 knowledge."""
        try:
            embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )
            persist_dir = os.environ.get("CHROMA_PERSIST_DIR", "./chroma_db")

            if os.path.exists(persist_dir):
                vectorstore = ChromaDB(
                    persist_directory=persist_dir,
                    embedding_function=embeddings,
                )
            else:
                # Build initial knowledge base from PECA 2016 content
                from knowledge_base import (
                    PECA_SECTIONS,
                    EVIDENCE_CHECKLISTS,
                    AUTHORITY_REFERRALS,
                    SAFETY_TIPS_FOR_CHILDREN,
                    SAFETY_TIPS_FOR_PARENTS,
                )

                documents = []
                metadatas = []

                # Add PECA sections as documents
                for crime_type, info in PECA_SECTIONS.items():
                    doc_text = (
                        f"Crime Type: {crime_type}\n"
                        f"PECA 2016 Sections: {', '.join(info['sections'])}\n"
                        f"Penalty: {info['penalty']}\n"
                        f"Description: {info['description']}"
                    )
                    documents.append(doc_text)
                    metadatas.append({"crime_type": crime_type, "category": "peca_sections"})

                # Add evidence checklists
                for crime_type, checklist in EVIDENCE_CHECKLISTS.items():
                    doc_text = (
                        f"Evidence Checklist for {crime_type}:\n"
                        + "\n".join(f"- {item}" for item in checklist)
                    )
                    documents.append(doc_text)
                    metadatas.append({"crime_type": crime_type, "category": "evidence"})

                # Add authority referrals
                for key, info in AUTHORITY_REFERRALS.items():
                    doc_text = (
                        f"Authority: {info['name']}\n"
                        f"Description: {info['description']}\n"
                        f"Helpline: {info.get('helpline', 'N/A')}\n"
                        f"Email: {info.get('email', 'N/A')}\n"
                        f"Website: {info.get('website', 'N/A')}"
                    )
                    documents.append(doc_text)
                    metadatas.append({"category": "authority", "authority_key": key})

                # Add safety tips
                for tip in SAFETY_TIPS_FOR_CHILDREN:
                    documents.append(f"Child Safety Tip: {tip}")
                    metadatas.append({"category": "child_safety_tip"})

                for tip in SAFETY_TIPS_FOR_PARENTS:
                    documents.append(f"Parent Safety Tip: {tip}")
                    metadatas.append({"category": "parent_safety_tip"})

                vectorstore = ChromaDB.from_texts(
                    texts=documents,
                    metadatas=metadatas,
                    embedding=embeddings,
                    persist_directory=persist_dir,
                )
                vectorstore.persist()

            return vectorstore
        except Exception as e:
            print(f"Warning: ChromaDB initialization failed: {e}")
            print("Falling back to LLM-only mode without RAG retrieval.")
            return None

    def _classify_crime(self, message: str) -> Optional[str]:
        """Simple keyword-based crime classification as fallback."""
        lower = message.lower()
        if any(w in lower for w in ["child", "بچ", "grooming", "minor", "cyberbully"]):
            return "child_safety"
        if any(w in lower for w in ["blackmail", "بلیک میل", "extort", "revenge"]):
            return "blackmailing"
        if any(w in lower for w in ["hack", "ہیک", "unauthorized", "stolen account"]):
            return "hacking"
        if any(w in lower for w in ["scam", "fraud", "دھوکہ", "phishing", "fake investment"]):
            return "financial_fraud"
        if any(w in lower for w in ["harass", "ہراسانی", "stalk", "threat", "abuse"]):
            return "harassment"
        return "other"

    def chat(
        self,
        message: str,
        chat_history: Optional[List[tuple]] = None,
        crime_type: Optional[str] = None,
        is_child_safety: bool = False,
    ) -> Dict[str, Any]:
        """
        Process a user message and return AI guidance.

        Args:
            message: The user's message
            chat_history: List of (role, content) tuples
            crime_type: Pre-classified crime type (optional)
            is_child_safety: Whether this is a child safety case

        Returns:
            Dict with 'reply' and 'crime_type' keys
        """
        system_prompt = CHILD_SAFETY_PROMPT if is_child_safety else SYSTEM_PROMPT

        # Build LangChain message history
        lc_messages = [SystemMessage(content=system_prompt)]

        if chat_history:
            for role, content in chat_history[-10:]:  # Keep last 10 messages
                if role == "user":
                    lc_messages.append(HumanMessage(content=content))
                elif role == "assistant":
                    lc_messages.append(AIMessage(content=content))

        # Add RAG context if vectorstore is available
        if self.vectorstore:
            try:
                relevant_docs = self.vectorstore.similarity_search(message, k=3)
                if relevant_docs:
                    context = "\n\n".join([doc.page_content for doc in relevant_docs])
                    lc_messages.append(
                        SystemMessage(
                            content=f"Relevant knowledge base information:\n{context}\n\nUse this information to enhance your response if relevant."
                        )
                    )
            except Exception:
                pass  # Fall back to LLM-only

        lc_messages.append(HumanMessage(content=message))

        try:
            response = self.llm.invoke(lc_messages)
            reply = response.content

            # Try to extract crime type from response
            detected_crime = crime_type or self._classify_crime(message)

            return {
                "reply": reply,
                "crime_type": detected_crime,
            }
        except Exception as e:
            return {
                "reply": (
                    "I apologize, but I'm having trouble connecting right now. "
                    "Please try again. If you're in immediate danger, please call "
                    "15 (Police) or 1122 (Emergency)."
                ),
                "crime_type": crime_type,
            }