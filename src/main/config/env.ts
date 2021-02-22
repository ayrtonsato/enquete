export default {
	mongoUrl: process.env.MONGO_URL || 'mongodb://mongo:27018/clean-node-api',
	port: process.env.PORT || 5000,
	jwtSecret: process.env.JWT_SECRET || '123XVCZasd12'
}
