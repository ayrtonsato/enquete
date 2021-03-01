import { AccessDeniedError } from '../errors'
import { forbidden } from '../helpers/http/http-helpers'
import { HttpRequest, HttpResponse } from '../protocols'
import { Middleware } from '../protocols/middleware'

export class AuthMiddleware implements Middleware {
	async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
		return forbidden(new AccessDeniedError())
	}
}
