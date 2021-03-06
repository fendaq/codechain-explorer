import * as _ from "lodash";
import { ParcelDoc, Converter } from "../DocType";
import { H256, SignedParcel } from "codechain-sdk/lib/core/classes";
import { BaseAction } from "./BaseAction";
import { ElasticSearchAgent } from "../ElasticSearchAgent";
import { Client, SearchResponse, CountResponse } from "elasticsearch";

export class QueryParcel implements BaseAction {
    public agent: ElasticSearchAgent;
    public client: Client;
    public async getParcel(hash: H256): Promise<ParcelDoc | null> {
        const response = await this.searchParcel({
            "sort": [
                { "parcelIndex": { "order": "desc" } },
                { "blockNumber": { "order": "desc" } }
            ],
            "size": 1,
            "query": {
                "bool": {
                    "must": [
                        { "term": { "isRetracted": false } },
                        { "term": { "hash": hash.value } }
                    ]
                }
            }
        });
        if (response.hits.total === 0) {
            return null;
        }
        return response.hits.hits[0]._source;
    }

    public async getParcels(page: number = 1, itemsPerPage: number = 5): Promise<ParcelDoc[]> {
        const response = await this.searchParcel({
            "sort": [
                { "parcelIndex": { "order": "desc" } },
                { "blockNumber": { "order": "desc" } }
            ],
            "from": (page - 1) * itemsPerPage,
            "size": itemsPerPage,
            "query": {
                "bool": {
                    "must": [
                        { "term": { "isRetracted": false } }
                    ]
                }
            }
        });
        return _.map(response.hits.hits, hit => hit._source);
    }

    public async getTotalParcelCount(): Promise<number> {
        const count = await this.countParcel({
            "query": {
                "term": { "isRetracted": false }
            }
        });
        return count.count;
    }

    public async getParcelsByPlatformAddress(address: string, page: number = 1, itemsPerPage: number = 3): Promise<ParcelDoc[]> {
        const response = await this.searchParcel({
            "sort": [
                {
                    "parcelIndex": { "order": "desc" }
                },
                {
                    "blockNumber": { "order": "desc" }
                }
            ],
            "from": (page - 1) * itemsPerPage,
            "size": itemsPerPage,
            "query": {
                "bool": {
                    "must": [
                        { "term": { "isRetracted": false } },
                        {
                            "bool": {
                                "should": [
                                    { "term": { "sender": address } },
                                    { "term": { "action.receiver": address } }
                                ]
                            }
                        }
                    ]
                }
            }
        });
        return _.map(response.hits.hits, hit => hit._source);
    }

    public async getTotalParcelCountByPlatformAddress(address: string): Promise<number> {
        const count = await this.countParcel({
            "query": {
                "bool": {
                    "must": [
                        { "term": { "isRetracted": false } },
                        {
                            "bool": {
                                "should": [
                                    { "term": { "sender": address } },
                                    { "term": { "action.receiver": address } }
                                ]
                            }
                        }
                    ]
                }
            }
        });
        return count.count;
    }

    public async searchParcel(body: any): Promise<SearchResponse<any>> {
        return this.client.search({
            index: "parcel",
            type: "_doc",
            body
        });
    }

    public async retractParcel(parcelHash: H256): Promise<void> {
        return this.updateParcel(parcelHash, { "isRetracted": true });
    }

    public async indexParcel(currentParcels: SignedParcel[], parcel: SignedParcel, timestamp: number): Promise<any> {
        const parcelDoc: ParcelDoc = await Converter.fromParcel(currentParcels, parcel, this.agent, timestamp);
        return this.client.index({
            index: "parcel",
            type: "_doc",
            id: parcel.hash().value,
            body: parcelDoc,
            refresh: "wait_for"
        });
    }

    public async updateParcel(hash: H256, partial: any): Promise<any> {
        return this.client.update({
            index: "parcel",
            type: "_doc",
            id: hash.value,
            refresh: "wait_for",
            body: {
                doc: partial
            }
        });
    }

    public async countParcel(body: any): Promise<CountResponse> {
        return this.client.count({
            index: "parcel",
            type: "_doc",
            body
        });
    }
}
