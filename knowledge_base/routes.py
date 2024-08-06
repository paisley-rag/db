import copy

import nest_asyncio

import db.knowledge_base.mongo_helper as mongo
from db.knowledge_base.kb_config import KnowledgeBase
import db.app_logger as log

nest_asyncio.apply()

def get_all():
   return mongo.get_knowledge_bases()

def get_one(kb_name):
    kb_config = mongo.get_knowledge_base(kb_name)
    if kb_config:
        return kb_config
    else:
        return { "message": f"{kb_name} does not exist" }

def create(client_config):
    if mongo.get_knowledge_base(client_config['kb_name']):
        message = f"{client_config['kb_name']} already exists"
    else:
        kb_config = create_kb_config(client_config)
        result = mongo.insert_knowledge_base(kb_config)
        log.info("knowledge base created: ", result)
        message = f"{kb_config['kb_name']} created"

    return {"message": message}

def create_kb_config(client_config):
    kb_config = copy.copy(client_config)
    kb_config["id"] = kb_config["kb_name"]
    kb_config["splitter_config"] = str_to_nums(kb_config["splitter_config"])
    kb_config["files"] = []
    log.info("kb_config.py _create_kb_config: ", client_config, kb_config)
    return kb_config

def str_to_nums(config_dict):
    result = {}
    for key in config_dict:
        if is_int(config_dict[key]):
            result[key] = int(config_dict[key])
        elif is_float(config_dict[key]):
            result[key] = float(config_dict[key])
        else:
            result[key] = config_dict[key]
    
    return result

def is_int(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

def is_float(value):
    try:
        float(value)
        return True
    except ValueError:
        return False
    

async def upload_file(id, file):
    log.info("in route", file.filename)
    if not mongo.get_knowledge_base(id):
        return {"message": f"Knowledge base {id} doesn't exist"}
    elif mongo.file_exists(id, file):
        return {"message": f"{file.filename} already exists in {id}"}
    
    else:
        kb = KnowledgeBase(id)
        log.info("in logic", file.filename)
        try:
            await kb.ingest_file(file)
            return {"message": f"{file.filename} uploaded"}
        except Exception as e:
            return {"message": f"Error: {e}"}


# def create_kb(client_config):
    # add properties to client_config
    # kb_config = create_kb_config(client_config)
    # log.info("kb_config.py create (classmethod): ", kb_config)

    # insert knowledge base configuration into database
    # result = mongo.insert_knowledge_base(kb_config)
    # log.info("create_kb: ", result)
    # # name = kb_config["kb_name"]
    
    # return {"message": f"{kb_config["kb_name"]} created"}