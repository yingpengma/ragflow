#
#  Copyright 2025 The InfiniFlow Authors. All Rights Reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#


import pytest
from common import batch_create_datasets, delete_dataset


@pytest.fixture(scope="class")
def get_dataset_ids(get_http_api_auth, request):
    def cleanup():
        delete_dataset(get_http_api_auth)

    request.addfinalizer(cleanup)

    return batch_create_datasets(get_http_api_auth, 5)
