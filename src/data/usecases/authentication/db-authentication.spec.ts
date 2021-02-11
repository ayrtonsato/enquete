
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { AccountModel } from '../add-account/db-add-account-protocols'
import { DbAuthentication } from './db-authentication'

describe('DbAuthentication UseCase', () => {
	test('Should call LoadAccountByEmailRepository with correct email', async () => {
		class LoadAccountByRepositoryStub implements LoadAccountByEmailRepository {
			async load (email: string): Promise<AccountModel> {
				const account: AccountModel = {
					id: 'any_id',
					name: 'any_name',
					email: 'any_email@email.com',
					password: 'any_password'
				}
				return await new Promise(resolve => resolve(account))
			}
		}
		const loadAccountByRepositoryStub = new LoadAccountByRepositoryStub()
		const sut = new DbAuthentication(loadAccountByRepositoryStub)
		const loadSpy = jest.spyOn(loadAccountByRepositoryStub, 'load')
		await sut.auth({
			email: 'any_email@email.com',
			password: 'any_password'
		})
		expect(loadSpy).toHaveBeenCalledWith('any_email@email.com')
	})
})