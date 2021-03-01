import { LoadAccountByEmailRepository } from '../../../../data/protocols/db/account/load-account-by-email-repository'
import { AccountModel } from '../../../../domain/models/account'
import { AddAccountModel } from '../../../../domain/usecases/add-account'
import { MongoHelper } from '../helpers/mongo-helper'
import { AddAccountRepository } from '../../../../data/protocols/db/account/add-account-repository'
import { UpdateAccessTokenRepository } from '../../../../data/protocols/db/account/update-access-token-repository'
import { LoadAccountByToken } from '../../../../domain/usecases/load-account-by-token'

export class AccountMongoRepository implements AddAccountRepository, LoadAccountByEmailRepository, UpdateAccessTokenRepository, LoadAccountByToken {
	async add (accountData: AddAccountModel): Promise<AccountModel> {
		const accountCollection = await MongoHelper.getCollection('accounts')
		const result = await accountCollection.insertOne(accountData)
		return MongoHelper.map(result.ops[0])
	}

	async loadByEmail (email: string): Promise<AccountModel> {
		const accountCollection = await MongoHelper.getCollection('accounts')
		const account = await accountCollection.findOne({ email })
		return account && MongoHelper.map(account)
	}

	async updateAccessToken (id: string, token: string): Promise<void> {
		const accountCollection = await MongoHelper.getCollection('accounts')
		await accountCollection.updateOne({
			_id: id
		}, {
			$set: {
				accessToken: token
			}
		})
	}

	async loadByToken (accessToken: string, role?: string): Promise<AccountModel> {
		const accountCollection = await MongoHelper.getCollection('accounts')
		const account = await accountCollection.findOne({
			accessToken, role
		})
		return account && MongoHelper.map(account)
	}
}
