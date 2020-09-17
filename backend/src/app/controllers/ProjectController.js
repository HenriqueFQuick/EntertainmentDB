const express = require('express')

const Task = require('../models/Tasks')
const Projects = require('../models/Projects')

module.exports = {
    async index(req, res){
        try{
            //Buscar o projeto com o id desejado, retornando também as informções das tasks e do usuário ( se n usar o populate, iri retornar apenas os id's desses campos)
            const projects = await Projects.find().populate(['user', 'tasks']);

            return res.send({ projects })

        }catch(err){
            return res.status(400).send({ error: "Error loading projects"})
        }
    },
    async create(req, res){
        try{

            const{ title, description, tasks} = req.body

            //criar um projeto com as informacoes ( menos as tasks )
            const project = await Projects.create({title, description, user: req.userId})

            //Para cada task informada, criar um objeto Task e adiciona-lo no array de tasks do projeto
            await Promise.all(tasks.map(async task =>{
                const projectTask = new Task({ ...task, project: project._id })//new Task é a mesma coisa de Task.create, porém no new ele não salva, apenas cria, enquanto o create cria e salva

                await projectTask.save()
                project.tasks.push(projectTask)
            }))

            await project.save()

            return res.send({project})

        }catch(err){
            return res.status(400).send({ error: "Error creating new project"})
        }
    },
    async delete(req, res){
        try{
            //TODO -> deletar as taks relacionadas com este projeto
            //deletar os projetos com o id selecionado
            await Projects.findByIdAndRemove(req.params.projectId).populate('user');

            return res.send()

        }catch(err){
            return res.status(400).send({ error: "Error deleting project"})
        }
    },
    async update(req, res){
        try{

            const{ title, description, tasks} = req.body

            //atualizar um projeto com as informacoes ( menos as tasks )
            const project = await Projects.findByIdAndUpdate(req.params.projectId, {title, description}, { new: true})

            //deletar as tasks existentes no projeto
            project.tasks = []
            await Task.remove({ project: project._id })

            //Para cada task informada, criar um objeto Task e adiciona-lo no array de tasks do projeto
            await Promise.all(tasks.map(async task =>{
                const projectTask = new Task({ ...task, project: project._id })//new Task é a mesma coisa de Task.create, porém no new ele não salva, apenas cria, enquanto o create cria e salva

                await projectTask.save()
                project.tasks.push(projectTask)
            }))

            await project.save()

            return res.send({project})

        }catch(err){
            return res.status(400).send({ error: "Error updating project"})
        }
    },
    async show(req, res){
        try{
            //buscar o projeto com o id informado, retornando também as informções das tasks e do usuário ( se n usar o populate, iri retornar apenas os id's desses campos)
            const project = await Projects.findById(req.params.projectId).populate(['user', 'tasks']);

            return res.send({ project })

        }catch(err){
            return res.status(400).send({ error: "Error loading project"})
        }
    },
    async indexTask(req, res){
        //requisicao de teste
        try{
            //Buscar o projeto com o id desejado, retornando também as informções das tasks e do usuário ( se n usar o populate, iri retornar apenas os id's desses campos)
            const tasks = await Task.find().populate('assignedTo');

            return res.send({ tasks })

        }catch(err){
            return res.status(400).send({ error: "Error loading Tasks"})
        }
    }
}