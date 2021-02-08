import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingParamError } from '../errors/missing-param-error'
import { badRequest } from '../helpers/http-helpers'

export class SingUpController {
	handle (httpRequest: HttpRequest): HttpResponse {
		const requiredField = ['name', 'email', 'password', 'passwordConfirmation']
		for (const field of requiredField) {
			if (!httpRequest.body[field]) {
				return badRequest(new MissingParamError(field))
			}
		}
	}
}
