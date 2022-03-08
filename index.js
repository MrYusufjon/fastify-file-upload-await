'use strict'

const fp = require('fastify-plugin')
const kMultipart = Symbol('multipart')
const fileUpload = require('express-fileupload')

function setMultipart(request, payload, done) {
    request[kMultipart] = true
    done()
}

async function fastifyUpload(fastify, options) {

    await fastify.addContentTypeParser('multipart', setMultipart)

    options = options || {}
    try {
        await fastify.use(fileUpload(options))
    } catch (e) {
        await fastify.register(require('middie'))
        await fastify.use(fileUpload(options))
    }

    fastify.addHook('preValidation', (request, reply, done) => {
        if (request.raw) {
            !request.body && (request.body = request.raw.body || {})
            if (request.raw.files) {
                for (const key in request.raw.files) {
                    request.body[key] = request.raw.files[key]
                }
            }
        }
        done()
    })
}

module.exports = fp(fastifyUpload, {
    fastify: '>=3.0.0',
    name: 'fastify-file-upload'
})