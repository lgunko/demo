const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;


class DbClientService {
    constructor() {
        let uri = "mongodb+srv://leonid1:leonid1@cluster0-zmiqp.mongodb.net/AdministratorsApp?retryWrites=true";
        let dbName = 'DemoApp';
        let client = new MongoClient(uri, { useNewUrlParser: true });
        this._db = this._tryCountTimesToConnect(client, dbName, 0, 10);
    }

    async _tryCountTimesToConnect(client, dbName, tryCount, maxTryCount) {
        tryCount++;
        try {
            await client.connect();
            return client.db(dbName);
        }
        catch (err) {
            if (tryCount > maxTryCount) {
                throw err;
            }
            else
                return this._tryCountTimesToConnect(client, dbName, tryCount, maxTryCount);
        }
    };

    get db() {
        return this._db;
    }
}

async function initiateDbClientService() {
    let instance = new DbClientService();
    Object.freeze(instance);
    return instance
}

const MongoService = (function () {
    let _serviceInstances = {};

    let _allOrgServiceInstance = null;
    let instanceDbClientService = null;


    return {
        getInstance: async function (org) {
            if (!instanceDbClientService) {
                instanceDbClientService = await initiateDbClientService();
            }
            if (!_serviceInstances[org]) {
                _serviceInstances[org] = new _MongoService(instanceDbClientService, org);
            }
            return _serviceInstances[org];
        },
        getAllOrgInstance: async function () {
            if (!instanceDbClientService) {
                instanceDbClientService = await initiateDbClientService();
            }
            if (!_allOrgServiceInstance) {
                _allOrgServiceInstance = new _AllOrgsMongoService(instanceDbClientService)
            }
            return _allOrgServiceInstance
        },
    };
})();



class _MongoService {

    constructor(dbClientService, org) {
        this.dbClientService = dbClientService;
        this.org = org;
    }

    async findAll(collectionName, query, projection) {
        query = this._prepareQuery(query);
        let startTime = new Date().getTime();
        let result = await (await this.dbClientService.db).collection(collectionName).find(query, { projection: projection }).toArray();
        console.log("findAll: " + collectionName + " query: " + JSON.stringify(query) + " projection: " + JSON.stringify(projection) + " time: " + (new Date().getTime() - startTime));
        return result;
    }

    async findOne(collectionName, id, projection) {
        var queryById = this._prepareQuery(null);
        queryById['_id'] = new ObjectId(id);
        let startTime = new Date().getTime();
        let result = await (await this.dbClientService.db).collection(collectionName).findOne(queryById, { projection: projection });
        console.log("findOne: " + collectionName + " query: " + JSON.stringify(queryById) + " projection: " + JSON.stringify(projection) + " time: " + (new Date().getTime() - startTime));
        return result;
    }

    async exists(collectionName, id) {
        var queryById = this._prepareQuery(undefined);
        queryById['_id'] = new ObjectId(id);
        let startTime = new Date().getTime();
        let result = (await (await this.dbClientService.db).collection(collectionName).find(queryById, { projection: { _id: 1 } }).limit(1).count()) > 0;
        console.log("exists: " + collectionName + " time: " + (new Date().getTime() - startTime));
        return result;
    }

    async existsAny(collectionName, query) {
        var query = this._prepareQuery(query);
        let startTime = new Date().getTime();
        let result = (await (await this.dbClientService.db).collection(collectionName).find(query, { projection: { _id: 1 } }).limit(1).count()) > 0;
        console.log("existsAny: " + collectionName + " query: " + JSON.stringify(query) + " time: " + (new Date().getTime() - startTime));
        return result;
    }

    async saveOne(collectionName, object) {
        object.org = this.org;
        let startTime = new Date().getTime();
        let result = await (await this.dbClientService.db).collection(collectionName).insertOne(object);
        console.log("saveOne: " + collectionName + " time: " + (new Date().getTime() - startTime));
        return result;
    }

    async updateOne(collectionName, object) {
        let startTime = new Date().getTime();
        if (!object._id) {
            throw "to update you need to specify _id";
        }
        var objectOld = await this.findOne(collectionName, new ObjectId(object._id));
        if (!objectOld) {
            throw "object does not exist"
        }
        Object.getOwnPropertyNames(object).forEach(key => {
            objectOld[key] = object[key];
        });
        object = objectOld;
        if (await this.deleteOne(collectionName, object._id) == 1) {
            await this.saveOne(collectionName, object);
            console.log("updateOne: " + collectionName + " time: " + (new Date().getTime() - startTime));
            return object;
        }
        else {
            throw "unable to update object";
        }
    }

    async deleteOne(collectionName, id) {
        var queryById = this._prepareQuery(null);
        queryById['_id'] = new ObjectId(id);
        return (await (await this.dbClientService.db).collection(collectionName).deleteOne(queryById)).deletedCount;
    }

    _prepareQuery(query) {
        if (!query)
            query = {};
        query['org'] = this.org;
        return query;
    }
}


class _AllOrgsMongoService {

    constructor(dbClientService) {
        this.dbClientService = dbClientService;
    }

    async findEmployeeOrgsByEmail(email) {
        let startTime = new Date().getTime();
        let result = await (await this.dbClientService.db).collection("employees").find({ email: email }, { projection: { _id: 0, org: 1, role: 1 } }).toArray()
        console.log("findEmployeeOrgsByEmail: time: " + (new Date().getTime() - startTime));
        return result
    }

}

module.exports = MongoService

