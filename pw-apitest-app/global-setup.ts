import { expect, request } from "@playwright/test"
import user from './.auth/user.json'
import * as fs from 'fs'

async function globalSetup(){
    const authFile = '.auth/user.json'
    const context = await request.newContext ()
    const responseToken = await context.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
        "user": {
        "email": "pwkoch@test.com",
        "password": "pwkoch"
        }
    }
    })
    const responseBody = await responseToken.json()
    const accessToken = responseBody.user.token
    user.origins[0].localStorage[0].value = accessToken
    fs.writeFileSync(authFile, JSON.stringify(user))
    process.env['ACCESS_TOKEN'] = accessToken

    const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data: {
            "article":{
            "tagList": [],
            "title": "Global Likes test article madafaka",
            "description": "This is a description test",
            "body": "This is a body test"
            }
        },
        headers: {
            Authorization: `Token ${process.env.ACCESS_TOKEN}`
        }
    })
    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId
}

export default globalSetup
