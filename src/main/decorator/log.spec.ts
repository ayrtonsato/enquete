import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'
import { serverError } from '../../presentation/helpers/http-helpers'
import { LogErrorRepository } from '../../data/protocols/log-error-repository'

interface SutTypes {
	sut: LogControllerDecorator
	controllerStub: Controller
	logErrorRepositoryStub: LogErrorRepository
}

const makeLogErrorRepository = (): LogErrorRepository => {
	class LogErrorRepositoryStub implements LogErrorRepository {
		async log (stackError: string): Promise<void> {
			return await new Promise(resolve => resolve())
		}
	}
	const logErrorRepositoryStub = new LogErrorRepositoryStub()
	return logErrorRepositoryStub
}

const makeController = (): Controller => {
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
	return controllerStub
}

const makeSut = (): SutTypes => {
	const controllerStub = makeController()
	const logErrorRepositoryStub = makeLogErrorRepository()
	const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStub)
	return {
		sut,
		controllerStub,
		logErrorRepositoryStub
	}
}

describe('LogController Decorator', () => {
	test('Should call controller handle', async () => {
		const { sut, controllerStub } = makeSut()
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

	test('Should return the same result of the controller', async () => {
		const { sut } = makeSut()
		const httpRequest = {
			body: {
				email: 'any_email',
				name: 'any_name',
				password: 'any_pass',
				passwordConfirmation: 'any_pass'
			}
		}
		const httpResponse = await sut.handle(httpRequest)
		expect(httpResponse).toEqual({
			statusCode: 200,
			body: {
				name: 'Rodrigo'
			}
		})
	})

	test('Should call LogErrorRepository with correct error if controller returns a server error', async () => {
		const { sut, controllerStub, logErrorRepositoryStub } = makeSut()
		const fakeError = new Error()
		fakeError.stack = 'any_stack'
		const error = serverError(fakeError)
		const logSpy = jest.spyOn(logErrorRepositoryStub, 'log')
		jest.spyOn(controllerStub, 'handle')
			.mockReturnValueOnce(new Promise((resolve) => resolve(
				error
			)))
		const httpRequest = {
			body: {
				email: 'any_email',
				name: 'any_name',
				password: 'any_pass',
				passwordConfirmation: 'any_pass'
			}
		}
		await sut.handle(httpRequest)
		expect(logSpy).toHaveBeenCalledWith('any_stack')
	})
})
