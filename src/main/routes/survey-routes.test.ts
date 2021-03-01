import request from 'supertest'
import app from '../config/app'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import { Collection } from 'mongodb'

let surveyCollection: Collection

describe('Survey Routes', () => {
	beforeAll(async () => {
		await MongoHelper.connect(process.env.MONGO_URL)
	})

	afterAll(async () => {
		await MongoHelper.disconnect()
	})

	beforeEach(async () => {
		surveyCollection = await MongoHelper.getCollection('accounts')
		await surveyCollection.deleteMany({})
	})

	describe('POST /surveys', () => {
		test('Should return 204 on add survey success', async () => {
			await request(app)
				.post('/api/surveys')
				.send({
					question: 'Question',
					answers: [{
						image: 'http://image-name.com',
						answer: 'Answer1'
					}, {
						answer: 'Answer2'
					}]
				})
				.expect(204)
		})
	})
})