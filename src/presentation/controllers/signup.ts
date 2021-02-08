import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingParamError } from '../errors/missing-param-error'
import { badRequest } from '../helpers/http-helpers'

export class SingUpController {
	handle (httpRequest: HttpRequest): HttpResponse {
		if (!httpRequest.body.name) {
			return badRequest(new MissingParamError('name'))
		}
		if (!httpRequest.body.email) {
			return badRequest(new MissingParamError('email'))
		}
		const requiredField = ['name', 'email']
		for (const field of requiredField) {
			if (!httpRequest.body[field]) {
				return badRequest(new MissingParamError(field))
			}
		}
	}
}
