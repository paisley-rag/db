import os

from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.storage.docstore.mongodb import MongoDocumentStore
from llama_index.core import StorageContext
from dotenv import load_dotenv
import Stemmer

import app_logger as log

load_dotenv(dotenv_path='../.', override=True)

# configs
db_name = 'keyword1'
# top_k = 5



# general
mongo_uri = os.environ["MONGO_URI"]
store = MongoDocumentStore.from_uri(uri=mongo_uri, db_name=db_name)

storage_context = StorageContext.from_defaults(
    docstore=store
)



# methods
def write_to_db(file_path):
    if os.path.isdir(file_path):
        documents = SimpleDirectoryReader(file_path).load_data()
    else:
        documents = SimpleDirectoryReader(input_files=[file_path]).load_data()

    splitter = SentenceSplitter(chunk_size=512)

    nodes = splitter.get_nodes_from_documents(documents)

    storage_context.docstore.add_documents(nodes)
    log.info(f"keyword.py write_to_db: {file_path} written to db {db_name}", mongo_uri)



def get_retriever(top_k):
    bm25_retriever = BM25Retriever.from_defaults(
        docstore=store,
        similarity_top_k=top_k,
        stemmer=Stemmer.Stemmer('english'),
        language='english',
    )

    log.info(f"keyword.py get_retriever: bm25 retriever returned")
    return bm25_retriever



