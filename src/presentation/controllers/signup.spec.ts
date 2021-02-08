import { SingUpController } from './signup'

describe('Signup Controller', () => {
	test('Should return 400 if no name is provided', () => {
		const sut = new SingUpController()
		const httpRequest = {
			body: {
				email: 'any_name@email.com',
				password: 'any_password',
				passwordConfirmation: 'any_password'
			}
		}
		const httpResponse = sut.handle(httpRequest)
		expect(httpResponse.statusCode).toBe(400)
	})
})
