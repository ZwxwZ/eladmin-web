import axios from 'axios'
import { getToken } from '@/utils/auth'

export function upload(api, file) {
  var data = new FormData()
  data.append('file', file)
  const config = {
    headers: { 'Authorization': getToken() }
  }
  return axios.post(api, data, config)
}

export function localStorageUrl(localStorage, baseApi) {
  return `${baseApi}/file/${localStorage.type}/${localStorage.realName}`
}

export function uploadUrl(fileUploadApi, uploadFilename) {
  return fileUploadApi + '?name=' + uploadFilename
}

export function removeValueFromString(inputString, valueToRemove) {
  valueToRemove = valueToRemove + ''
  // Ensure inputString is not undefined or null
  if (inputString === undefined || inputString === null) {
    return ''
  }

  // Ensure valueToRemove is not undefined or null
  if (valueToRemove === undefined || valueToRemove === null) {
    return inputString
  }

  // Split the comma-separated string into an array
  const valuesArray = inputString.split(',')

  // Remove the specific value
  const filteredArray = valuesArray.filter(
    (value) => value !== undefined && value.trim() !== valueToRemove.trim()
  )

  console.log(filteredArray)
  // Join the array back into a string using commas
  return filteredArray.join(',')
}

