import { HttpRequest, HttpResponse, Controller, EmailValidator } from '../protocols'
import { MissingParamError, InvalidParamError } from '../errors'
import { badRequest, serverError } from '../helpers/http-helpers'

export class SingUpController implements Controller {
	private readonly emailValidator: EmailValidator

	constructor (emailValidator: EmailValidator) {
		this.emailValidator = emailValidator
	}

	handle (httpRequest: HttpRequest): HttpResponse {
		try {
			const requiredField = ['name', 'email', 'password', 'passwordConfirmation']
			for (const field of requiredField) {
				if (!httpRequest.body[field]) {
					return badRequest(new MissingParamError(field))
				}
			}
			const isValid = this.emailValidator.isValid(httpRequest.body.email)
			if (!isValid) {
				return badRequest(new InvalidParamError('email'))
			}
		} catch (error) {
			return serverError()
		}
	}
}
