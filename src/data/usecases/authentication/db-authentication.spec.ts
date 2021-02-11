import { DbAuthentication } from './db-authentication'
import {
	AuthenticationModel,
	HashComparer,
	TokenGenerator,
	LoadAccountByEmailRepository,
	UpdateAccessTokenRepository,
	AccountModel
} from './db-authentication-protocols'
interface SutTypes {
	sut: DbAuthentication
	loadAccountByRepositoryStub: LoadAccountByEmailRepository
	hashComparerStub: HashComparer
	tokenGeneratorStub: TokenGenerator
	updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
}

const makeFakeAccount = (): AccountModel => ({
	id: 'any_id',
	name: 'any_name',
	email: 'any_email@email.com',
	password: 'hashed_password'
})
const makeFakeAuthentication = (): AuthenticationModel => ({
	email: 'any_email@email.com',
	password: 'any_password'
})

const makeTokenGenerator = (): TokenGenerator => {
	class TokenGeneratorStub implements TokenGenerator {
		async generate (id: string): Promise<string> {
			return await new Promise(resolve => resolve('any_token'))
		}
	}
	return new TokenGeneratorStub()
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
	class LoadAccountByRepositoryStub implements LoadAccountByEmailRepository {
		async load (email: string): Promise<AccountModel> {
			return await new Promise(resolve => resolve(makeFakeAccount()))
		}
	}
	return new LoadAccountByRepositoryStub()
}

const makeHashComparer = (): HashComparer => {
	class HashComparerStub implements HashComparer {
		async compare (value: string, hash: string): Promise<boolean> {
			return await new Promise(resolve => resolve(true))
		}
	}
	return new HashComparerStub()
}

const makeUpdateAccessTokenRepository = (): UpdateAccessTokenRepository => {
	class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
		async update (id: string, token: string): Promise<void> {
			return await new Promise(resolve => resolve())
		}
	}
	return new UpdateAccessTokenRepositoryStub()
}

const makeSut = (): SutTypes => {
	const loadAccountByRepositoryStub = makeLoadAccountByEmailRepository()
	const tokenGeneratorStub = makeTokenGenerator()
	const hashComparerStub = makeHashComparer()
	const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepository()
	const sut = new DbAuthentication(
		loadAccountByRepositoryStub, hashComparerStub, tokenGeneratorStub, updateAccessTokenRepositoryStub
	)
	return {
		sut,
		loadAccountByRepositoryStub,
		hashComparerStub,
		tokenGeneratorStub,
		updateAccessTokenRepositoryStub
	}
}

describe('DbAuthentication UseCase', () => {
	test('Should call LoadAccountByEmailRepository with correct email', async () => {
		const {
			sut,
			loadAccountByRepositoryStub
		} = makeSut()
		const loadSpy = jest.spyOn(loadAccountByRepositoryStub, 'load')
		await sut.auth(makeFakeAuthentication())
		expect(loadSpy).toHaveBeenCalledWith('any_email@email.com')
	})

	test('Should throw if LoadAccountByEmailRepository throws', async () => {
		const {
			sut,
			loadAccountByRepositoryStub
		} = makeSut()
		jest.spyOn(loadAccountByRepositoryStub, 'load')
			.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const promise = sut.auth(makeFakeAuthentication())
		await expect(promise).rejects.toThrow()
	})

	test('Should return null if LoadAccountByEmailRepository returns null', async () => {
		const {
			sut,
			loadAccountByRepositoryStub
		} = makeSut()
		jest.spyOn(loadAccountByRepositoryStub, 'load')
			.mockReturnValueOnce(null)
		const token = await sut.auth(makeFakeAuthentication())
		expect(token).toBeNull()
	})

	test('Should call HashComparer with correct values', async () => {
		const {
			sut,
			hashComparerStub
		} = makeSut()
		const compareSpy = jest.spyOn(hashComparerStub, 'compare')
		await sut.auth(makeFakeAuthentication())
		expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
	})

	test('Should throws if HashComparer throws', async () => {
		const {
			sut,
			hashComparerStub
		} = makeSut()
		jest.spyOn(hashComparerStub, 'compare')
			.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const promise = sut.auth(makeFakeAuthentication())
		await expect(promise).rejects.toThrow()
	})

	test('Should return null if HashComparer returns null', async () => {
		const {
			sut,
			hashComparerStub
		} = makeSut()
		jest.spyOn(hashComparerStub, 'compare')
			.mockReturnValueOnce(new Promise(resolve => resolve(false)))
		const token = await sut.auth(makeFakeAuthentication())
		expect(token).toBeNull()
	})

	test('Should call TokenGenerator with correct id', async () => {
		const {
			sut,
			tokenGeneratorStub
		} = makeSut()
		const generateSpy = jest.spyOn(tokenGeneratorStub, 'generate')
		await sut.auth(makeFakeAuthentication())
		expect(generateSpy).toHaveBeenCalledWith('any_id')
	})

	test('Should throws if TokenGenerator throws', async () => {
		const {
			sut,
			tokenGeneratorStub
		} = makeSut()
		jest.spyOn(tokenGeneratorStub, 'generate')
			.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const promise = sut.auth(makeFakeAuthentication())
		await expect(promise).rejects.toThrow()
	})

	test('Should call TokenGenerator with correct id', async () => {
		const {
			sut
		} = makeSut()
		const accessToken = await sut.auth(makeFakeAuthentication())
		expect(accessToken).toBe('any_token')
	})

	test('Should call UpdateAccessTokenRepository with correct values', async () => {
		const {
			sut,
			updateAccessTokenRepositoryStub
		} = makeSut()
		const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'update')
		await sut.auth(makeFakeAuthentication())
		expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token')
	})

	test('Should throws if UpdateAccessTokenRepository throws', async () => {
		const {
			sut,
			updateAccessTokenRepositoryStub
		} = makeSut()
		jest.spyOn(updateAccessTokenRepositoryStub, 'update')
			.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
		const promise = sut.auth(makeFakeAuthentication())
		await expect(promise).rejects.toThrow()
	})
})
