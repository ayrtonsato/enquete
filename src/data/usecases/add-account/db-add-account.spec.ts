import { Hasher, AddAccountModel, AccountModel, AddAccountRepository } from './db-add-account-protocols'
import { DbAddAccount } from './db-add-account'
import { LoadAccountByEmailRepository } from '../authentication/db-authentication-protocols'

interface SutTypes {
	sut: DbAddAccount
	hasherStub: Hasher
	addAccountRepositoryStub: AddAccountRepository
	loadAccountByRepositoryStub: LoadAccountByEmailRepository
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
	class LoadAccountByRepositoryStub implements LoadAccountByEmailRepository {
		async loadByEmail (email: string): Promise<AccountModel> {
			return await new Promise(resolve => resolve(null))
		}
	}
	return new LoadAccountByRepositoryStub()
}

const makeHasher = (): Hasher => {
	class HasherStub implements Hasher {
		async hash (password: string): Promise<string> {
			return await new Promise(resolve => resolve('hashed_password'))
		}
	}
	return new HasherStub()
}

const makeFakeAccountData = (): AddAccountModel => ({
	name: 'valid_name',
	email: 'valid_email@email.com',
	password: 'valid_password'
})

const makeFakeAccount = (): AccountModel => ({
	id: 'valid_id',
	name: 'valid_name',
	email: 'valid_email@email.com',
	password: 'hashed_password'
})

const makeAddAccountRepository = (): AddAccountRepository => {
	class AddAccountRepositoryStub implements AddAccountRepository {
		async add (accountData: AddAccountModel): Promise<AccountModel> {
			return await new Promise(resolve => resolve(makeFakeAccount()))
		}
	}
	return new AddAccountRepositoryStub()
}

const makeSut = (): SutTypes => {
	const loadAccountByRepositoryStub = makeLoadAccountByEmailRepository()
	const hasherStub = makeHasher()
	const addAccountRepositoryStub = makeAddAccountRepository()
	const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub, loadAccountByRepositoryStub)
	return {
		sut,
		hasherStub,
		addAccountRepositoryStub,
		loadAccountByRepositoryStub
	}
}

describe('DbAddAccount', () => {
	test('Should call Hasher with correct password', async () => {
		const { sut, hasherStub } = makeSut()
		const encryptSpy = jest.spyOn(hasherStub, 'hash')
		await sut.add(makeFakeAccountData())
		expect(encryptSpy).toHaveBeenCalledWith('valid_password')
	})

	test('Should throw if Hasher throws', async () => {
		const { sut, hasherStub } = makeSut()
		jest
			.spyOn(hasherStub, 'hash')
			.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const promise = sut.add(makeFakeAccountData())
		await expect(promise).rejects.toThrow()
	})

	test('Should call AddAccountRepository with correct values', async () => {
		const { sut, addAccountRepositoryStub } = makeSut()
		const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')
		await sut.add(makeFakeAccountData())
		expect(addSpy).toHaveBeenCalledWith({
			name: 'valid_name',
			email: 'valid_email@email.com',
			password: 'hashed_password'
		})
	})

	test('Should throw if AddAccountRepository throws', async () => {
		const { sut, addAccountRepositoryStub } = makeSut()
		jest
			.spyOn(addAccountRepositoryStub, 'add')
			.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const promise = sut.add(makeFakeAccountData())
		await expect(promise).rejects.toThrow()
	})

	test('Should return an account on success', async () => {
		const { sut } = makeSut()
		const account = await sut.add(makeFakeAccountData())
		expect(account).toEqual(makeFakeAccount())
	})

	test('Should call LoadAccountByEmailRepository with correct email', async () => {
		const {
			sut,
			loadAccountByRepositoryStub
		} = makeSut()
		const loadSpy = jest.spyOn(loadAccountByRepositoryStub, 'loadByEmail')
		await sut.add(makeFakeAccountData())
		expect(loadSpy).toHaveBeenCalledWith('valid_email@email.com')
	})

	test('Should return null if LoadAccountByEmailRepository not return null', async () => {
		const { sut, loadAccountByRepositoryStub } = makeSut()
		jest.spyOn(loadAccountByRepositoryStub, 'loadByEmail').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeAccount())))
		const account = await sut.add(makeFakeAccountData())
		expect(account).toBeNull()
	})
})
