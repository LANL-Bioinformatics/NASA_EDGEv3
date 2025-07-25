import { createAsyncThunk } from '@reduxjs/toolkit'

import { putData } from 'src/edge/common/util'
import { addError } from '../messageSlice'

const updateUploadAsync = createAsyncThunk(
  'admin/updateUpload',
  async (uploadData, { dispatch }) => {
    try {
      await putData(`/api/admin/nasa/uploads/${uploadData.code}`, uploadData)
    } catch (err) {
      if (typeof err === 'string') {
        dispatch(addError({ [uploadData.code]: err }))
      } else {
        if (err.error) {
          dispatch(addError({ [uploadData.code]: JSON.stringify(err.error) }))
        } else {
          dispatch(addError({ [uploadData.code]: 'API server error' }))
        }
      }
    }
  },
)

export const updateUploadAdmin = (uploadData) => (dispatch, getState) => {
  dispatch(updateUploadAsync(uploadData))
}
