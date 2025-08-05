from flask import Flask, request, send_from_directory, render_template, jsonify
import os, gridfs, pika, json
from flask_pymongo import PyMongo 
from auth import validate
from auth_svc import access
from storage import utils

server = Flask(__name__, static_folder='static', template_folder='templates')
server.config["MONGO_URI"] = "mongodb://host.minikube.internal:27017/videos"
mongo = PyMongo(server)

fs = gridfs.GridFS(mongo.db)

connection = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
channel = connection.channel()  


@server.route('/')
def index():
    return render_template('index.html')


@server.route('/upload-page')
def upload_page():
    return render_template('upload.html')


@server.route('/login', methods=["POST"])
def login():
    token, err = access.login(request)

    if not err:
        return token
    else:
        return err


@server.route('/register', methods=["POST"])
def register():
    message, err = access.register(request)
    
    if not err:
        return message, 201
    else:
        return err


@server.route('/upload', methods=["POST"])
def upload():
    access_token, err = validate.token(request)

    if err:
        return err

    access_data = json.loads(access_token)

    if access_data["admin"]:
        if len(request.files) != 1:
            return "Exactly one file is allowed", 400
        
        for _, f in request.files.items():
            err = utils.upload(f, fs, channel, access_data)

            if err: 
                return err
        
        return "success", 200
    else:
        return "unauthorized", 401

    
if __name__ == "__main__":
    server.run(host="0.0.0.0", port=8080)
