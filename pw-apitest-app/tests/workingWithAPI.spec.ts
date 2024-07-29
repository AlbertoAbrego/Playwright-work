import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async ({ page }) => {
  //mocking API
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })
  //end mocking
  await page.goto('https://conduit.bondaracademy.com/');
});

test('has title', async ({ page }) => {
  //modify API response
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a test title bitch"
    responseBody.articles[0].description = "And this is the description"
  
    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })
  //end modify API response
  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a test title bitch')
  await expect(page.locator('app-article-list p').first()).toContainText('And this is the description')
});

test('delete article', async ({page, request}) => {
  
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article":{
        "tagList": [],
        "title": "This is a title test",
        "description": "This is a description test",
        "body": "This is a body test"
      }
    }
  })
  expect(articleResponse.status()).toEqual(201)
  await page.getByText('Global Feed').click()
  await page.getByText('This is a title test').click()
  await page.getByRole('button', {name: "Delete Article"}).first().click()
  await expect(page.locator('app-article-list h1').first()).not.toContainText('This is a test title bitch')
})

test('create article', async ({page, request}) => {
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name: 'Article Title'}).fill('Testing with playwright')
  await page.getByRole('textbox', {name: "What's this article about?"}).fill('About playwright')
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('Body')
  await page.getByRole('button', {name: 'Publish Article'}).click()
  //intercept API response
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug
  console.log(slugId)
  
  await expect(page.locator('.article-page h1')).toHaveText('Testing with playwright')
  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  
  await expect(page.locator('app-article-list h1').first()).toHaveText('Testing with playwright')

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`)
  expect(deleteArticleResponse.status()).toEqual(204)
})
