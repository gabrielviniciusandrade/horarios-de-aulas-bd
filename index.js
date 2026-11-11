// npm init -> cria o pacote inicial API
// npm i express
const express = require("express")
const app = express()
app.use(express.json())
const port = 3000
// npm i mysql2
const db = require("./db")


// ROTAS DE AULA


app.get("/aula", async (req, res) => {
    try {
        const resultado = await db.pool.query("SELECT * FROM aula")
        res.status(200).json(resultado[0])
    } catch (erro) {
        res.status(500).json({ erro: erro.message })
    }
})

app.post("/aula", async (req, res) => {
    try {
        const dados = req.body
        const resultado = await db.pool.query(
            "INSERT INTO aula (serie, turma, componente, professor) VALUES (?, ?, ?, ?)",
            [dados.serie, dados.turma, dados.componente, dados.professor]
        )
        res.status(201).json(
            { resultado: "Aula cadastrada, ID = " + resultado[0].insertId }
        )
    } catch (erro) {
        res.status(500).json({ erro: erro.message })
    }
})


// 1. DELETE /aula/:id


app.delete("/aula/:id", async (req, res) => {
    try {
        const id = req.params.id
        const resultado = await db.pool.query(
            "DELETE FROM aula WHERE id = ?",
            [id]
        )

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({ erro: "Aula não encontrada." })
        }

        res.status(200).json({ resultado: "Aula removida com sucesso." })
    } catch (erro) {
        // Erro 1451 ocorre se tentar apagar uma aula que já tem horários vinculados
        if (erro.errno === 1451) {
            return res.status(400).json({
                erro: "Não é possível apagar esta aula pois existem horários cadastrados para ela."
            })
        }
        res.status(500).json({ erro: erro.message })
    }
})


// ROTAS DE HORÁRIO


// 2. POST /horario

app.post("/horario", async (req, res) => {
    try {
        const dados = req.body
        // Ajuste os nomes das colunas (dia, hora_inicio, hora_fim, id_aula) conforme o seu banco
        const resultado = await db.pool.query(
            "INSERT INTO horario (dia, hora_inicio, hora_fim, id_aula) VALUES (?, ?, ?, ?)",
            [dados.dia, dados.hora_inicio, dados.hora_fim, dados.id_aula]
        )
        res.status(201).json(
            { resultado: "Horário cadastrado, ID = " + resultado[0].insertId }
        )
    } catch (erro) {
        // Erro 1452 do MySQL: Falha na restrição de chave estrangeira (id_aula não existe)
        if (erro.errno === 1452) {
            return res.status(400).json({
                erro: "Erro de chave estrangeira: A aula informada (id_aula) não existe."
            })
        }
        res.status(500).json({ erro: erro.message })
    }
})

// 3. GET /horario/:dia

app.get("/horario/:dia", async (req, res) => {
    try {
        const dia = req.params.dia
        const resultado = await db.pool.query(
            "SELECT * FROM horario WHERE dia = ?",
            [dia]
        )
        res.status(200).json(resultado[0])
    } catch (erro) {
        res.status(500).json({ erro: erro.message })
    }
})

// 4. DELETE /horario/:id

app.delete("/horario/:id", async (req, res) => {
    try {
        const id = req.params.id
        const resultado = await db.pool.query(
            "DELETE FROM horario WHERE id = ?",
            [id]
        )

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({ erro: "Horário não encontrado." })
        }

        res.status(200).json({ resultado: "Horário removido com sucesso." })
    } catch (erro) {
        res.status(500).json({ erro: erro.message })
    }
})

app.listen(port, () => {
    console.log("API rodando na porta " + port)
})

// No Rapid Client:
// GET http://127.0.0.1:3000/aula



