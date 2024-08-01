import { test as setup, expect } from '@playwright/test';

setup('create new article', async ({request}) => {
    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data: {
            "article":{
            "tagList": [],
            "title": "Likes test article",
            "description": "This is a description test",
            "body": "This is a body test"
            }
        }
    })
    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId
})