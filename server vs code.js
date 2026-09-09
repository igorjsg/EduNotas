const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edunotas",
    waitForConnections: true,
    connectionLimit: 10
});

app.get("/", (req, res) => {
    res.json({
        mensagem: "API EduNotas funcionando!"
    });
});

app.get("/teste-banco", async (req, res) => {
    try {
        const [resultado] = await pool.query("SELECT 1 AS teste");

        res.json({
            sucesso: true,
            mensagem: "Conexão com o banco funcionando!",
            resultado
        });
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao conectar com o banco de dados.",
            erro: erro.message
        });
    }
});

app.post("/usuarios", async (req, res) => {
    try {
        const { nome, email, senha, tipo } = req.body;

        const [resultado] = await pool.query(
            "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)",
            [nome, email, senha, tipo]
        );

        res.json({
            sucesso: true,
            mensagem: "Usuário cadastrado com sucesso!",
            id: resultado.insertId
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar usuário.",
            erro: erro.message
        });
    }
});

app.post("/notas", async (req, res) => {
const { aluno_id, disciplina, nota } = req.body;
if (!aluno_id || !disciplina || nota === undefined) {
    return res.status(400).json({
        sucesso: false,
        mensagem: "Preencha todos os campos."
    });
}

if (nota < 0 || nota > 10) {
    return res.status(400).json({
        sucesso: false,
        mensagem: "A nota deve estar entre 0 e 10."
    });
}
try {
    const [alunos] = await pool.query(
    "SELECT id FROM usuarios WHERE id = ? AND tipo = 'ALUNO'",
    [aluno_id]
);

if (alunos.length === 0) {
    return res.status(404).json({
        sucesso: false,
        mensagem: "Aluno não encontrado."
    });
}
    const [resultado] = await pool.query(
    "INSERT INTO notas (aluno_id, disciplina, nota) VALUES (?, ?, ?)",
    [aluno_id, disciplina, nota]
);

res.json({
    sucesso: true,
    mensagem: "Nota cadastrada com sucesso!",
    id: resultado.insertId
});} catch (erro) {
console.error(erro);

res.status(500).json({
    sucesso: false,
    mensagem: "Erro ao cadastrar nota.",
    erro: erro.message
});
}
});

app.get("/notas", async (req, res) => {
    try {
        const [notas] = await pool.query("SELECT * FROM notas ORDER BY id DESC");
        res.json(notas);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar notas.",
            erro: erro.message
        });
    }
});
app.delete("/notas/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await pool.query(
            "DELETE FROM notas WHERE id = ?",
            [id]
        );

        res.json({
            sucesso: true,
            mensagem: "Nota excluída com sucesso!"
        });
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao excluir nota.",
            erro: erro.message
        });
    }
});
app.put("/notas/:id", async (req, res) => {
    const { id } = req.params;
    const { disciplina, nota } = req.body;

    try {
        await pool.query(
            "UPDATE notas SET disciplina = ?, nota = ? WHERE id = ?",
            [disciplina, nota, id]
        );

        res.json({
            sucesso: true,
            mensagem: "Nota atualizada com sucesso!"
        });
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar nota.",
            erro: erro.message
        });
    }
});
app.listen(PORT, () => {
    console.log(`EduNotas rodando em http://localhost:${PORT}`);
});