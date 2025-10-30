from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# --- Configuración MySQL desde variables de entorno ---
db_config = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", ""),
    "database": os.getenv("MYSQL_DATABASE", "mi_basedatos")
}

# --- Conexión a MySQL ---
try:
    db = mysql.connector.connect(**db_config)
    cursor = db.cursor(dictionary=True)
    print("✅ Conectado correctamente a MySQL")
except Exception as e:
    print("❌ Error al conectar con MySQL:", e)

# --- Página principal ---
@app.route('/')
def home():
    return render_template("index.html")

# --- API: Registro ---
@app.route('/api/registro', methods=['POST'])
def registrar_usuario():
    data = request.json
    if not all(k in data for k in ("nombre", "email", "password")):
        return jsonify({"error": "Faltan datos"}), 400

    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (data["email"],))
    if cursor.fetchone():
        return jsonify({"error": "El correo ya está registrado"}), 400

    cursor.execute(
        "INSERT INTO usuarios (nombre, email, password) VALUES (%s, %s, %s)",
        (data["nombre"], data["email"], data["password"])
    )
    db.commit()
    return jsonify({"message": "Usuario registrado exitosamente"}), 200

# --- API: Login ---
@app.route('/api/login', methods=['POST'])
def iniciar_sesion():
    data = request.json
    cursor.execute(
        "SELECT * FROM usuarios WHERE email = %s AND password = %s",
        (data["email"], data["password"])
    )
    user = cursor.fetchone()
    if user:
        return jsonify({"message": "Inicio de sesión exitoso"}), 200
    return jsonify({"error": "Credenciales incorrectas"}), 401

# --- API: Contacto ---
@app.route('/api/contacto', methods=['POST'])
def contacto():
    data = request.json
    cursor.execute(
        "INSERT INTO contactos (nombre, email, mensaje) VALUES (%s, %s, %s)",
        (data["nombre"], data["email"], data["mensaje"])
    )
    db.commit()
    return jsonify({"message": "Mensaje recibido correctamente"}), 200

if __name__ == '__main__':
    print("🚀 Servidor Flask conectado correctamente")
    app.run(host="0.0.0.0", port=5000)
