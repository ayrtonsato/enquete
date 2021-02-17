import {
	HttpRequest,
	HttpResponse,
	Controller,
	AddAccount,
	Validation
} from './signup-controller-protocols'
import { badRequest, serverError, ok } from '../../helpers/http/http-helpers'

export class SignUpController implements Controller {
	constructor (
		private readonly addAccount: AddAccount,
		private readonly validation: Validation
	) {}

	async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
		try {
			const error = this.validation.validate(httpRequest.body)
			if (error) {
				return badRequest(error)
			}
			const { name, email, password } = httpRequest.body
			const account = await this.addAccount.add({
				name,
				email,
				password
			})
			return ok(account)
		} catch (error) {
			return serverError(error)
		}
	}
}
