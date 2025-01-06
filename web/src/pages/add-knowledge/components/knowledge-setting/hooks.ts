import { LlmModelType } from '@/constants/knowledge';
import { useSetModalState } from '@/hooks/common-hooks';
import {
  useFetchKnowledgeBaseConfiguration,
  useRenameTag,
  useUpdateKnowledge,
} from '@/hooks/knowledge-hooks';
import { useSelectLlmOptionsByModelType } from '@/hooks/llm-hooks';
import { useNavigateToDataset } from '@/hooks/route-hook';
import { useSelectParserList } from '@/hooks/user-setting-hooks';
import {
  getBase64FromUploadFileList,
  getUploadFileListFromBase64,
} from '@/utils/file-util';
import { useIsFetching } from '@tanstack/react-query';
import { Form, UploadFile } from 'antd';
import { FormInstance } from 'antd/lib';
import pick from 'lodash/pick';
import { useCallback, useEffect, useState } from 'react';

export const useSubmitKnowledgeConfiguration = (form: FormInstance) => {
  const { saveKnowledgeConfiguration, loading } = useUpdateKnowledge();
  const navigateToDataset = useNavigateToDataset();

  const submitKnowledgeConfiguration = useCallback(async () => {
    const values = await form.validateFields();
    const avatar = await getBase64FromUploadFileList(values.avatar);
    saveKnowledgeConfiguration({
      ...values,
      avatar,
    });
    navigateToDataset();
  }, [saveKnowledgeConfiguration, form, navigateToDataset]);

  return {
    submitKnowledgeConfiguration,
    submitLoading: loading,
    navigateToDataset,
  };
};

// The value that does not need to be displayed in the analysis method Select
const HiddenFields = ['email', 'picture', 'audio'];

export const useFetchKnowledgeConfigurationOnMount = (form: FormInstance) => {
  const parserList = useSelectParserList();
  const allOptions = useSelectLlmOptionsByModelType();

  const { data: knowledgeDetails } = useFetchKnowledgeBaseConfiguration();

  useEffect(() => {
    const fileList: UploadFile[] = getUploadFileListFromBase64(
      knowledgeDetails.avatar,
    );
    form.setFieldsValue({
      ...pick(knowledgeDetails, [
        'description',
        'name',
        'permission',
        'embd_id',
        'parser_id',
        'language',
        'parser_config',
        'pagerank',
      ]),
      avatar: fileList,
    });
  }, [form, knowledgeDetails]);

  return {
    parserList: parserList.filter(
      (x) => !HiddenFields.some((y) => y === x.value),
    ),
    embeddingModelOptions: allOptions[LlmModelType.Embedding],
    disabled: knowledgeDetails.chunk_num > 0,
  };
};

export const useSelectKnowledgeDetailsLoading = () =>
  useIsFetching({ queryKey: ['fetchKnowledgeDetail'] }) > 0;

export const useHandleChunkMethodChange = () => {
  const [form] = Form.useForm();
  const chunkMethod = Form.useWatch('parser_id', form);

  useEffect(() => {
    console.log('🚀 ~ useHandleChunkMethodChange ~ chunkMethod:', chunkMethod);
  }, [chunkMethod]);

  return { form, chunkMethod };
};

export const useRenameKnowledgeTag = () => {
  const [tag, setTag] = useState<string>('');
  const {
    visible: tagRenameVisible,
    hideModal: hideTagRenameModal,
    showModal: showFileRenameModal,
  } = useSetModalState();
  const { renameTag, loading } = useRenameTag();

  const onTagRenameOk = useCallback(
    async (name: string) => {
      const ret = await renameTag({
        fromTag: tag,
        toTag: name,
      });

      if (ret === 0) {
        hideTagRenameModal();
      }
    },
    [renameTag, tag, hideTagRenameModal],
  );

  const handleShowTagRenameModal = useCallback(
    (record: string) => {
      setTag(record);
      showFileRenameModal();
    },
    [showFileRenameModal],
  );

  return {
    renameLoading: loading,
    initialName: tag,
    onTagRenameOk,
    tagRenameVisible,
    hideTagRenameModal,
    showTagRenameModal: handleShowTagRenameModal,
  };
};
