import useVisibleModelsInRange from '@/hooks/useVisibleModel';
import { useMemo } from 'react';
import StatusPanel from '.';

const StatusPanelManagement = ({ titleList = [] }: { titleList: string[] }) => {
  const { visibleModels } = useVisibleModelsInRange(5, titleList);

  const model = useMemo(() => {
    return visibleModels?.length > 0 ? visibleModels[0] : null;
  }, [visibleModels]);

  return <>{model && <StatusPanel model={model} />}</>;
};

export default StatusPanelManagement;
