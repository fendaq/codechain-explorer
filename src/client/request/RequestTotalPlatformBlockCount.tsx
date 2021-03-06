import * as React from "react";
import { Dispatch, connect } from "react-redux";

import { apiRequest, ApiError } from "./ApiRequest";

interface OwnProps {
    address: string;
    onTotalCount: (totalCount: number) => void;
    onError: (e: ApiError) => void;
}

interface DispatchProps {
    dispatch: Dispatch;
}

type Props = OwnProps & DispatchProps;

class RequestTotalPlatfromBlockCountInternal extends React.Component<Props> {
    public componentWillMount() {
        const { onError, onTotalCount, dispatch, address } = this.props;
        apiRequest({ path: `addr-platform-blocks/${address}/totalCount`, dispatch, showProgressBar: true }).then((response: any) => {
            onTotalCount(response);
        }).catch(onError);
    }

    public render() {
        return (null);
    }
}

const RequestTotalPlatfromBlockCount = connect(null, ((dispatch: Dispatch) => {
    return { dispatch }
}))(RequestTotalPlatfromBlockCountInternal);

export default RequestTotalPlatfromBlockCount;
