import request from 'supertest'
import app from '../config/app'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper'

describe('Signup Routes', () => {
	beforeAll(async () => {
		await MongoHelper.connect(process.env.MONGO_URL)
	})

	afterAll(async () => {
		await MongoHelper.disconnect()
	})

	beforeEach(async () => {
		const accountCollection = MongoHelper.getCollection('accounts')
		await accountCollection.deleteMany({})
	})

	test('Should reach signup routes', async () => {
		await request(app)
			.post('/api/signup')
			.send({
				name: 'valid_name',
				email: 'valid_email@email.com',
				password: 'valid_password',
				passwordConfirmation: 'valid_password'
			})
			.expect(200)
	})
})
