import {
	AddAccount,
	AddAccountModel,
	AccountModel,
	Hasher,
	AddAccountRepository,
	LoadAccountByEmailRepository
} from './db-add-account-protocols'

export class DbAddAccount implements AddAccount {
	constructor (
		private readonly hasher: Hasher,
		private readonly addAccountRepository: AddAccountRepository,
		private readonly loadAccountByRepository: LoadAccountByEmailRepository
	) {}

	async add (accountData: AddAccountModel): Promise<AccountModel> {
		const account = await this.loadAccountByRepository.loadByEmail(accountData.email)
		if (!account) {
			const hashedPassword = await this.hasher.hash(accountData.password)
			const newAccount = await this.addAccountRepository
				.add(
					Object.assign({}, accountData, { password: hashedPassword })
				)
			return newAccount
		}
		return null
	}
}
