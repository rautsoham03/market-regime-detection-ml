import os

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

# -------------------------------
# Load knowledge base documents
# -------------------------------

docs = []
base_path = r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\rag_advisor\knowledge_base"

for file in os.listdir(base_path):
    # Only process text or markdown files
    if file.endswith(('.txt', '.md')):
        file_path = os.path.join(base_path, file)
        with open(file_path, "r", encoding="utf-8") as f:
            docs.append(f.read())

# -------------------------------
# Split documents into chunks
# -------------------------------

splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=50
)

documents = splitter.create_documents(docs)

# -------------------------------
# Create FREE local embeddings
# -------------------------------

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# -------------------------------
# Build FAISS vector store
# -------------------------------

vectorstore = FAISS.from_documents(documents, embeddings)

# -------------------------------
# Save vector index locally
# -------------------------------

vectorstore.save_local(r"C:\Users\sanke\OneDrive\Desktop\PythonProject\market-regime-detection-ml\rag_advisor\knowledge_base\faiss_index")

print("RAG index built successfully using free open-source embeddings")
