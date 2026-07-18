import { useMemo, useState } from 'react';
import { TDataObject, TDataObjectNew, TDataRootObject } from './types';
import { DataObjectUtils, DataUtils } from '../utils';

export function useNewDataObject(source: TDataObjectNew) {
    const initData = useMemo(() => {
        return source.initFct?.() ?? {};
    }, []);

    const initMetaData = useMemo(() => {
        return source.initMeta?.() ?? {};
    }, []);

    const initRootObject = useMemo(() => {
        const initRootObj: TDataRootObject = {
            type: 'obj',
            data: DataObjectUtils.cloneDataObjectMap(initData),
            id: 1,
            maxID: 2,
            metaInfo: { ...initMetaData },
        };
        const provider = DataUtils.newHandleProvider();
        DataObjectUtils.updateUniqueID(initRootObj, provider);
        initRootObj.maxID = provider();
        return initRootObj;
    }, [initData]);

    const [obj, updateObj] = useState<TDataRootObject>(initRootObject);

    const objHandle = useMemo(() => {
        return {
            state: obj,
            updateState: updateRootObj,
        };
    }, [obj]);

    return useMemo(() => {
        return DataObjectUtils.create(objHandle, source.strictMode ?? false, () => objHandle.state.maxID);
    }, [objHandle]);

    function updateRootObj(fct: (prev: TDataObject) => TDataObject) {
        updateObj((prev) => {
            return {
                ...fct(prev),
                maxID: prev.maxID + 1,
            };
        });
    }
}
