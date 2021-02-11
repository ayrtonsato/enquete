import {
	Controller,
	Authentication,
	HttpRequest,
	HttpResponse,
	EmailValidator
} from './login-protocols'
import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, serverError, unauthorized } from '../../helpers/http-helpers'

export class LoginController implements Controller {
	private readonly emailValidator: EmailValidator
	private readonly authentication: Authentication

	constructor (emailValidator: EmailValidator, authentication: Authentication) {
		this.emailValidator = emailValidator
		this.authentication = authentication
	}

	async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
		try {
			const requiredField = ['email', 'password']
			for (const field of requiredField) {
				if (!httpRequest.body[field]) {
					return badRequest(new MissingParamError(field))
				}
			}
			const { email, password } = httpRequest.body
			const isValid = this.emailValidator.isValid(email)
			if (!isValid) {
				return badRequest(new InvalidParamError('email'))
			}
			const accessToken = await this.authentication.auth(email, password)
			if (!accessToken) {
				return unauthorized()
			}
		} catch (err) {
			return serverError(err)
		}
	}
}
