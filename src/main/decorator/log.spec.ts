import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

describe('LogController Decorator', () => {
	test('Should call controller handle', async () => {
		class ControllerStub implements Controller {
			async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
				const httpResponse: HttpResponse = {
					statusCode: 200,
					body: {
						name: 'Rodrigo'
					}
				}
				return await new Promise(resolve => resolve(httpResponse))
			}
		}
		const controllerStub = new ControllerStub()
		const sut = new LogControllerDecorator(controllerStub)
		const handleSpy = jest.spyOn(controllerStub, 'handle')
		const httpRequest = {
			body: {
				email: 'any_email',
				name: 'any_name',
				password: 'any_pass',
				passwordConfirmation: 'any_pass'
			}
		}
		await sut.handle(httpRequest)
		expect(handleSpy).toHaveBeenCalledWith(httpRequest)
	})
})
