from langchain_community.document_loaders import PyPDFLoader, TextLoader, CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_ollama import OllamaLLM
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
import os
import glob

# Adjust paths to be absolute or relative to project root
# Using logic stable regardless of where the app is started from
# Current file is in App/backend/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJ_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
DB_PATH = os.path.join(PROJ_ROOT, "Data", "storage", "chroma_db")
DOCS_PATH = os.path.join(PROJ_ROOT, "Data", "storage", "documents")

# Global variables for the pipeline
embedding_model = None
vectorstore = None
retriever = None
llm = None
qa_chain = None

def load_documents():
    documents = []
    if not os.path.exists(DOCS_PATH):
        os.makedirs(DOCS_PATH)
        
    for file_path in glob.glob(f"{DOCS_PATH}/*"):
        try:
            if file_path.endswith(".pdf"):
                loader = PyPDFLoader(file_path)
            elif file_path.endswith(".txt"):
                loader = TextLoader(file_path, encoding="utf-8")
            elif file_path.endswith(".csv"):
                loader = CSVLoader(file_path)
            else:
                continue
            documents.extend(loader.load())
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            continue
    return documents

def create_or_load_vectorstore():
    global embedding_model
    # Check if DB exists and has files
    if os.path.exists(DB_PATH) and len(os.listdir(DB_PATH)) > 0:
        # Load existing DB
        print("Loading existing vector store from", DB_PATH)
        vectorstore = Chroma(persist_directory=DB_PATH, embedding_function=embedding_model)
    else:
        # Create new
        print("Creating new vector store...")
        docs = load_documents()
        if not docs:
            print("No documents found. Initializing empty Chroma DB is complex without docs.")
            raise ValueError("No documents found in data/documents/")
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embedding_model,
            persist_directory=DB_PATH
        )
    return vectorstore

def check_ollama_connection(base_url: str = "http://localhost:11434"):
    import requests
    try:
        response = requests.get(f"{base_url}/api/tags")
        if response.status_code == 200:
            return True
        return False
    except Exception:
        return False

def init_rag_pipeline():
    global embedding_model, vectorstore, retriever, llm, qa_chain
    
    print("Initializing RAG pipeline...")
    
    # Check Ollama first
    if not check_ollama_connection():
        print("Warning: Ollama is not reachable at localhost:11434. RAG Chat will not function.")
        # We leaving qa_chain as None so query_rag returns the appropriate message
        return

    try:
        # Initialize embedding model (downloads if needed)
        if embedding_model is None:
            print("Loading embedding model...")
            embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        vectorstore = create_or_load_vectorstore()
        retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

        # Ensure you have run `ollama pull llama3.2:1b` or the model you specify
        print("Initializing LLM...")
        llm = OllamaLLM(model="llama3.2:1b")  

        # Custom Prompt to prevent "I don't know"
        prompt_template = """You are a helpful and intelligent AI assistant for the Trinetra Drone dashboard.
Use the following pieces of context to answer the user's question. 
If the context doesn't contain relevant information, use your own general knowledge to give a helpful answer. Do not simply say 'I don't know'.

Context:
{context}

Question: {question}

Helpful Answer:"""
        PROMPT = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": PROMPT}
        )
        print("RAG pipeline initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize RAG pipeline: {e}")
        qa_chain = None

def query_rag(question: str, history: list = None) -> dict:
    if not qa_chain:
        # Check specific reason if possible, or just generic
        if not check_ollama_connection():
             return {
                 "answer": "Error: Ollama is not reachable. Please make sure Ollama is installed and running (e.g. `ollama serve`).",
                 "sources": []
             }
        return {"answer": "RAG pipeline is not initialized (check logs, maybe no documents or model missing).", "sources": []}
    
    try:
        if history:
            # Format the last 6 messages to keep context window reasonable
            history_str = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in history[-6:]])
            augmented_question = f"Recent Conversation History:\n{history_str}\n\nNew Question: {question}"
        else:
            augmented_question = question

        result = qa_chain.invoke({"query": augmented_question})
        return {
            "answer": result["result"],
            "sources": [doc.metadata.get("source", "Unknown") for doc in result["source_documents"]]
        }
    except Exception as e:
        return {
            "answer": f"Error during query execution: {str(e)}",
            "sources": []
        }

def reload_pipeline():
    init_rag_pipeline()
