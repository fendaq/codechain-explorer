import * as React from "react";
import * as _ from "lodash";
import * as moment from "moment";
import { Table } from "reactstrap";

import "./LatestParcels.scss";
import HexString from "../../util/HexString/HexString";
import { BlockDoc } from "../../../../db/DocType";
import { Link } from "react-router-dom";
import { ActionBadge } from "../../util/ActionBadge/ActionBadge";
import { CommaNumberString } from "../../util/CommaNumberString/CommaNumberString";
import { changeQuarkStringToCCC } from "../../../utils/Formatter";

interface Props {
    blocksByNumber: {
        [n: number]: BlockDoc;
    }
}

const LatestParcels = (props: Props) => {
    const { blocksByNumber } = props;
    return <div className="latest-parcels">
        <h1>Latest Parcels</h1>
        <div className="latest-container">
            <Table striped={true} className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: '20%' }}>Type</th>
                        <th style={{ width: '25%' }}>Hash</th>
                        <th style={{ width: '20%' }}>Signer</th>
                        <th style={{ width: '15%' }}>Fee</th>
                        <th style={{ width: '20%' }}>Age</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        _.flatMap(_.reverse(_.values(blocksByNumber)), block => {
                            return _.map(block.parcels, (parcel) => {
                                return (
                                    <tr key={`home-parcel-${parcel.hash}`}>
                                        <td><ActionBadge parcel={parcel} /></td>
                                        <td scope="row"><HexString link={`/parcel/0x${parcel.hash}`} text={parcel.hash} /></td>
                                        <td><Link to={`/addr-platform/${parcel.sender}`}>{parcel.sender}</Link></td>
                                        <td><CommaNumberString text={changeQuarkStringToCCC(parcel.fee)} />CCC</td>
                                        <td>{moment.unix(block.timestamp).fromNow()}</td>
                                    </tr>
                                );
                            })
                        }).slice(0, 10)
                    }
                </tbody>
            </Table>
            {
                <div className="mt-small">
                    <Link to={"/parcels"}>
                        <button type="button" className="btn btn-primary w-100">
                            <span>View all parcels</span>
                        </button>
                    </Link>
                </div>
            }
        </div>
    </div>
};

export default LatestParcels;
