import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const normalizeReport = (value) => ({
        ...value,
        technicalQuestions: value?.technicalQuestions ?? [],
        behavioralQuestions: value?.behavioralQuestions ?? value?.behaviouralQuestions ?? [],
        skillGaps: value?.skillGaps ?? [],
        preparationPlan: value?.preparationPlan ?? []
    })

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })

            const normalizedReport = normalizeReport(response?.interviewReport)

            if (normalizedReport) {
                setReport(normalizedReport)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response?.interviewReport ? normalizeReport(response.interviewReport) : null
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            const normalizedReport = normalizeReport(response?.interviewReport)
            setReport(normalizedReport)
            return normalizedReport
        } catch (error) {
            console.log(error)
            setReport(null)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response?.interviewReports ?? [])
            return response?.interviewReports ?? []
        } catch (error) {
            console.log(error)
            setReports([])
            return []
        } finally {
            setLoading(false)
        }
    }
    
    const deleteReport = async (interviewId) => {
        setLoading(true)
        try{
            await deleteInterviewReport(interviewId)
            setReports(prevReports => prevReports.filter(report => report._id !== interviewId))
            return true
        }catch(err){
            console.log(err)
            return false
        }finally{
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf(interviewReportId)
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport }

}