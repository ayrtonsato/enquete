import { Decrypter } from '../../protocols/criptography/decrypter'
import { AccountModel } from '../add-account/db-add-account-protocols'
import { DbLoadAccountByToken } from './db-load-account-by-token'
import { LoadAccountByTokenRepository } from '../../protocols/db/account/load-account-by-token-repository'

interface SutTypes {
	sut: DbLoadAccountByToken
	decrypterStub: Decrypter
	loadAccountByTokenRepositoryStub: LoadAccountByTokenRepository
}

const makeFakeAccount = (): AccountModel => ({
	id: 'valid_id',
	name: 'valid_name',
	email: 'valid_email@email.com',
	password: 'hashed_password'
})

const makeLoadAccountByTokenRepository = (): LoadAccountByTokenRepository => {
	class LoadAccountByTokenRepositoryStub implements LoadAccountByTokenRepository {
		async loadByToken (token: string, role?: string): Promise<AccountModel> {
			return await new Promise(resolve => resolve(makeFakeAccount()))
		}
	}
	return new LoadAccountByTokenRepositoryStub()
}

const makeDecrypter = (): Decrypter => {
	class DecrypterStub implements Decrypter {
		async decrypt (value: string): Promise<string> {
			return await new Promise(resolve => resolve('any_token'))
		}
	}
	return new DecrypterStub()
}

const makeSut = (): SutTypes => {
	const loadAccountByTokenRepositoryStub = makeLoadAccountByTokenRepository()
	const decrypterStub = makeDecrypter()
	const sut = new DbLoadAccountByToken(decrypterStub, loadAccountByTokenRepositoryStub)
	return {
		decrypterStub,
		loadAccountByTokenRepositoryStub,
		sut
	}
}

describe('DbLoadAccountByToken UseCase', () => {
	test('Should call Decrypter with correct values', async () => {
		const { sut, decrypterStub } = makeSut()
		const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')
		await sut.load('any_token', 'any_role')
		expect(decryptSpy).toHaveBeenCalledWith('any_token')
	})

	test('Should return null if Decrypter returns null', async () => {
		const { sut, decrypterStub } = makeSut()
		jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(new Promise(resolve => resolve(null)))
		const account = await sut.load('any_token', 'any_role')
		expect(account).toBeNull()
	})

	test('Should call LoadAccountByTokenRepository with correct values', async () => {
		const { sut, loadAccountByTokenRepositoryStub } = makeSut()
		const loadByTokenSpy = jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken')
		await sut.load('any_token', 'any_role')
		expect(loadByTokenSpy).toHaveBeenCalledWith('any_token', 'any_role')
	})

	test('Should return null if LoadAccountByTokenRepository returns null', async () => {
		const { sut, loadAccountByTokenRepositoryStub } = makeSut()
		jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken')
			.mockReturnValueOnce(new Promise(resolve => resolve(null)))
		const account = await sut.load('any_token', 'any_role')
		expect(account).toBeNull()
	})

	test('Should return an account on success', async () => {
		const { sut } = makeSut()
		const account = await sut.load('any_token', 'any_role')
		expect(account).toEqual(makeFakeAccount())
	})

	test('Should throws if Decrypter throws', async () => {
		const {
			sut,
			decrypterStub
		} = makeSut()
		jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const promise = sut.load('any_token', 'any_role')
		await expect(promise).rejects.toThrow()
	})

	test('Should throws if loadAccountByTokenRepository throws', async () => {
		const {
			sut,
			loadAccountByTokenRepositoryStub
		} = makeSut()
		jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken')
			.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const promise = sut.load('any_token', 'any_role')
		await expect(promise).rejects.toThrow()
	})
})
