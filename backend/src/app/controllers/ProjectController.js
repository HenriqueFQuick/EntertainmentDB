const express = require('express')

module.exports = {
    async index(req, res){
        //requisicao de teste
        return res.send({ok: true, userId:req.userId})
    }
}