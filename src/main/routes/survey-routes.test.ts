import request from 'supertest'
import app from '../config/app'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'
import { Collection } from 'mongodb'
import { sign } from 'jsonwebtoken'
import env from '../config/env'

let surveyCollection: Collection
let accountCollection: Collection

describe('Survey Routes', () => {
	beforeAll(async () => {
		await MongoHelper.connect(process.env.MONGO_URL)
	})

	afterAll(async () => {
		await MongoHelper.disconnect()
	})

	beforeEach(async () => {
		surveyCollection = await MongoHelper.getCollection('surveys')
		accountCollection = await MongoHelper.getCollection('accounts')
		await surveyCollection.deleteMany({})
		await accountCollection.deleteMany({})
	})

	describe('POST /surveys', () => {
		test('Should return 403 on add survey without accessToken', async () => {
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
				.expect(403)
		})

		test('Should return 204 on add survey with valid token', async () => {
			const res = await accountCollection.insertOne({
				name: 'Ayrton',
				email: 'ayrtonsato@hotmail.com',
				password: '123',
				role: 'admin'
			})
			const id = res.ops[0]._id
			const accessToken = sign({ id }, env.jwtSecret)
			await accountCollection.updateOne({
				_id: id
			}, {
				$set: {
					accessToken
				}
			})
			await request(app)
				.post('/api/surveys')
				.set('x-access-token', accessToken)
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
