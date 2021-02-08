import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingParamError } from '../errors/missing-param-error'
import { badRequest } from '../helpers/http-helpers'
import { Controller } from '../protocols/controller'

export class SingUpController implements Controller {
	handle (httpRequest: HttpRequest): HttpResponse {
		const requiredField = ['name', 'email', 'password', 'passwordConfirmation']
		for (const field of requiredField) {
			if (!httpRequest.body[field]) {
				return badRequest(new MissingParamError(field))
			}
		}
	}
}
