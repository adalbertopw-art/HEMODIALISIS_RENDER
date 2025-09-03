{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 from flask import Flask, render_template, jsonify, request, send_from_directory\
from flask_cors import CORS\
import sqlite3\
import os\
from datetime import datetime\
\
app = Flask(__name__)\
CORS(app)\
\
DATABASE = 'hemodialysis.db'\
\
def init_db():\
    conn = sqlite3.connect(DATABASE)\
    cursor = conn.cursor()\
    \
    cursor.execute("""\
        CREATE TABLE IF NOT EXISTS pacientes (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            documento TEXT UNIQUE NOT NULL,\
            tipo_documento TEXT NOT NULL,\
            nombres TEXT NOT NULL,\
            apellidos TEXT NOT NULL,\
            fecha_nacimiento DATE NOT NULL,\
            genero TEXT NOT NULL,\
            telefono TEXT,\
            eps TEXT,\
            fecha_inicio_hd DATE NOT NULL,\
            causa_erc TEXT,\
            comorbilidades TEXT,\
            activo BOOLEAN DEFAULT 1,\
            fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP\
        )\
    """)\
    \
    cursor.execute("""\
        CREATE TABLE IF NOT EXISTS laboratorios (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            paciente_id INTEGER NOT NULL,\
            fecha DATETIME NOT NULL,\
            hemoglobina REAL,\
            ferritina REAL,\
            tsat REAL,\
            calcio REAL,\
            fosforo REAL,\
            pth REAL,\
            FOREIGN KEY (paciente_id) REFERENCES pacientes(id)\
        )\
    """)\
    \
    cursor.execute("""\
        CREATE TABLE IF NOT EXISTS alertas (\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            paciente_id INTEGER NOT NULL,\
            tipo TEXT NOT NULL,\
            categoria TEXT NOT NULL,\
            mensaje TEXT NOT NULL,\
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,\
            resuelta BOOLEAN DEFAULT 0,\
            prioridad INTEGER DEFAULT 1,\
            FOREIGN KEY (paciente_id) REFERENCES pacientes(id)\
        )\
    """)\
    \
    cursor.execute("SELECT COUNT(*) FROM pacientes")\
    if cursor.fetchone()[0] == 0:\
        pacientes_ejemplo = [\
            ('12345678', 'CC', 'Mar\'eda Elena', 'Gonz\'e1lez L\'f3pez', '1965-03-15', \
             'F', '3001234567', 'Nueva EPS', '2022-06-10', 'Diabetes Mellitus tipo 2', \
             'Hipertensi\'f3n arterial, Diabetes tipo 2'),\
            ('87654321', 'CC', 'Carlos Andr\'e9s', 'Rodr\'edguez Mart\'edn', '1958-08-22', \
             'M', '3109876543', 'Sanitas EPS', '2021-11-05', 'Nefropat\'eda hipertensiva', \
             'Hipertensi\'f3n arterial, Cardiopat\'eda isqu\'e9mica'),\
            ('45678912', 'CC', 'Ana Lucia', 'P\'e9rez Silva', '1972-12-03', \
             'F', '3156789012', 'SURA EPS', '2023-01-18', 'Glomerulonefritis cr\'f3nica', \
             'Anemia cr\'f3nica')\
        ]\
        \
        cursor.executemany("""\
            INSERT INTO pacientes (documento, tipo_documento, nombres, apellidos, \
            fecha_nacimiento, genero, telefono, eps, fecha_inicio_hd, causa_erc, comorbilidades)\
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\
        """, pacientes_ejemplo)\
        \
        laboratorios_ejemplo = [\
            (1, '2024-01-15', 10.2, 280, 22, 9.1, 4.8, 220),\
            (1, '2024-02-15', 9.8, 320, 25, 9.3, 5.2, 195),\
            (2, '2024-01-15', 11.1, 450, 28, 8.9, 4.5, 180),\
            (2, '2024-02-15', 10.9, 420, 26, 9.0, 4.7, 165),\
            (3, '2024-01-15', 9.5, 180, 18, 9.2, 5.1, 280),\
            (3, '2024-02-15', 10.1, 240, 21, 9.4, 4.9, 250)\
        ]\
        \
        cursor.executemany("""\
            INSERT INTO laboratorios (paciente_id, fecha, hemoglobina, ferritina, \
            tsat, calcio, fosforo, pth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\
        """, laboratorios_ejemplo)\
        \
        alertas_ejemplo = [\
            (1, 'MODERADA', 'ANEMIA', 'Hemoglobina: 10.2 g/dl. Evaluar incremento de AEE.', 3),\
            (2, 'PREVENTIVA', 'ACCESO_VASCULAR', 'Seguimiento rutinario programado.', 1),\
            (3, 'CRITICA', 'ANEMIA', 'Hemoglobina: 9.5 g/dl. Considerar ajuste urgente.', 4)\
        ]\
        \
        cursor.executemany("""\
            INSERT INTO alertas (paciente_id, tipo, categoria, mensaje, prioridad)\
            VALUES (?, ?, ?, ?, ?)\
        """, alertas_ejemplo)\
    \
    conn.commit()\
    conn.close()\
\
def get_db():\
    conn = sqlite3.connect(DATABASE)\
    conn.row_factory = sqlite3.Row\
    return conn\
\
@app.route('/')\
def index():\
    return render_template('index.html')\
\
@app.route('/static/<path:filename>')\
def static_files(filename):\
    return send_from_directory('static', filename)\
\
@app.route('/api/patients', methods=['GET'])\
def get_patients():\
    try:\
        conn = get_db()\
        cursor = conn.cursor()\
        \
        cursor.execute("""\
            SELECT id, documento, tipo_documento, nombres, apellidos, \
                   genero, eps, fecha_inicio_hd, causa_erc, activo,\
                   (julianday('now') - julianday(fecha_nacimiento)) / 365.25 as edad,\
                   (julianday('now') - julianday(fecha_inicio_hd)) / 30.44 as tiempo_dialisis_meses\
            FROM pacientes WHERE activo = 1\
            ORDER BY nombres, apellidos\
}