from flask import Flask, render_template, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from pymongo import MongoClient
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__,
            static_folder=os.path.join(BASE_DIR, "static"),
            template_folder=os.path.join(BASE_DIR, "templates"))
CORS(app)

# --- Conexión a MongoDB ---
client = MongoClient("mongodb://localhost:27017/")
db = client["mi_basedatos"]
usuarios = db["usuarios"]
contactos = db["contactos"]

# --- Página principal ---
@app.route('/')
def home():
    print("→ Cargando index.html desde:", os.path.join(BASE_DIR, "templates"))
    return render_template("index.html")

# --- API: Registro ---
@app.route('/api/registro', methods=['POST'])
def registrar_usuario():
    data = request.json
    if not all(k in data for k in ("nombre", "email", "password")):
        return jsonify({"error": "Faltan datos"}), 400

    if usuarios.find_one({"email": data["email"]}):
        return jsonify({"error": "El correo ya está registrado"}), 400

    usuarios.insert_one({
        "nombre": data["nombre"],
        "email": data["email"],
        "password": data["password"]
    })
    return jsonify({"message": "Usuario registrado exitosamente"}), 200

# --- API: Login ---
@app.route('/api/login', methods=['POST'])
def iniciar_sesion():
    data = request.json
    user = usuarios.find_one({
        "email": data["email"],
        "password": data["password"]
    })
    if user:
        return jsonify({"message": "Inicio de sesión exitoso"}), 200
    return jsonify({"error": "Credenciales incorrectas"}), 401

# --- API: Contacto ---
@app.route('/api/contacto', methods=['POST'])
def contacto():
    data = request.json
    contactos.insert_one(data)
    return jsonify({"message": "Mensaje recibido correctamente"}), 200

# --- Forzar Flask a servir estáticos ---
@app.route('/static/<path:filename>')
def static_files(filename):
    full_path = os.path.join(app.static_folder, filename)
    print("→ Sirviendo estático:", full_path)
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    print("Servidor Flask conectado correctamente 🚀")
    print("Static folder:", app.static_folder)
    print("Template folder:", app.template_folder)
    app.run(debug=True)

