'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const DURATION_DESCRIPTIONS = {
    7: "Total assessments in the past 7 days",
    30: "Total assessments in the past 30 days",
    90: "Total assessments in the past 90 days",
};

module.exports = createCoreController('api::analytic.analytic', ({ strapi }) => ({

    async getOverallAnalytics(ctx) {
        try {
            const { studentId, projectId, duration } = ctx.query;

            // Validate query parameters
            if (!studentId || !projectId) {
                return ctx.badRequest('studentId and projectId are required');
            }

            // Calculate date range based on duration
            const currentDate = new Date();
            const startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - parseInt(duration || 0));

            // Fetch data for the current period
            const currentQuestionbanks = await fetchDataForPeriod(studentId, startDate, currentDate,projectId);
            if (!currentQuestionbanks?.length) {
                return ctx.notFound('No data found for the given student and project');
            }

            // Fetch data for the previous period
            const previousStartDate = new Date(startDate);
            previousStartDate.setDate(startDate.getDate() - parseInt(duration || 0));
            const previousQuestionbanks = await fetchDataForPeriod(studentId, previousStartDate, startDate,projectId);

            // Fetch total number of topics
            const totalTopics = await strapi.db.query('api::topic.topic').count();

            // Calculate metrics for current and previous periods
            const currentMetrics = calculateMetrics(currentQuestionbanks, totalTopics);
            const previousMetrics = calculateMetrics(previousQuestionbanks, totalTopics);

            // Calculate change values
            const changeValues = calculateChangeValues(currentMetrics, previousMetrics);

            // Fetch recent activities
            const activities = await fetchRecentActivities(studentId,projectId);

            // Calculate session metrics (study time and timely completion)
            const { currentStudyTime, previousStudyTime, currentTimelyCompletion, previousTimelyCompletion } =
                await calculateSessionMetrics(studentId, projectId, startDate, previousStartDate);

            const studyTimeChange = calculateChange(currentStudyTime, previousStudyTime);
            const timelyCompletionChange = calculateChange(currentTimelyCompletion, previousTimelyCompletion);

            // Format metrics for response
            const metrics = {
                OverallGrade: formatMetric(`${currentMetrics.overallGrade}%`, `${changeValues.overallGrade}%`, 'Based on all assessments'),
                TrainingScore: formatMetric(`${currentMetrics.trainingScore}%`, `${changeValues.trainingScore}%`, 'All training performance'),
                CompletionRate: formatMetric(`${currentMetrics.completionRate}%`, `${changeValues.completionRate}%`, 'Study projects progress'),
                StudyTime: formatMetric(`${currentStudyTime}h`, `${studyTimeChange}%`, 'This month'),
                TimelyCompletion: formatMetric(`${currentTimelyCompletion}%`, `${timelyCompletionChange}%`, 'Sessions completed on time'),
                SubjectPerformance: calculateSubjectPerformance(currentQuestionbanks, totalTopics),
            };

            // Calculate additional analytics
            const assessmentAnalytics = calculateAssessmentAnalytics(currentQuestionbanks, previousQuestionbanks, duration);
            const trainingAnalytics = calculateTrainingAnalytics(currentQuestionbanks, previousQuestionbanks, duration);
            const topicProgress = calculateTopicCoverage(currentQuestionbanks, duration);

            // Return the response
            ctx.send({
                LearningAnalytics: metrics,
                RecentActivity: activities,
                AssessmentAnalytics: assessmentAnalytics,
                TrainingAnalytics: trainingAnalytics,
                TopicProgress: topicProgress,
            });

        } catch (error) {
            console.error(error);
            ctx.throw(500, 'An error occurred while fetching overall analytics');
        }
    },

    async getDashboardAnalytics(ctx) {
        try {
            const { studentId,duration } = ctx.query;

            // Validate query parameters
            if (!studentId) {
                return ctx.badRequest('studentId is required');
            }

            // Calculate date range based on duration
            const currentDate = new Date();
            const startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - parseInt(duration || 90));

            // Fetch data for the current period
            const currentQuestionbanks = await fetchDataForPeriod(studentId, startDate, currentDate);
            if (!currentQuestionbanks?.length) {
                return ctx.notFound('No data found for the given student and project');
            }

            // Fetch data for the previous period
            const previousStartDate = new Date(startDate);
            previousStartDate.setDate(startDate.getDate() - parseInt(duration || 0));
            const previousQuestionbanks = await fetchDataForPeriod(studentId, previousStartDate, startDate);

            // Fetch total number of topics
            const totalTopics = await strapi.db.query('api::topic.topic').count();

            // Calculate metrics for current and previous periods
            const currentMetrics = calculateMetrics(currentQuestionbanks, totalTopics);
            const previousMetrics = calculateMetrics(previousQuestionbanks, totalTopics);

            // Calculate change values
            const changeValues = calculateChangeValues(currentMetrics, previousMetrics);

            // Fetch recent activities
            const activities = await fetchRecentActivities(studentId);

       
            // Format metrics for response
            const metrics = {
                OverallGrade: formatMetric(`${currentMetrics.overallGrade}%`, `${changeValues.overallGrade}%`, 'Based on all assessments'),
                SubjectPerformance: calculateSubjectPerformance(currentQuestionbanks, totalTopics),
                TotalProjects:await strapi.db.query('api::studyproject.studyproject').count(),
                TotalAssessments: await getTotalAssessmentLast3Months(studentId),
                TotalTrainings: await getTotalTrainingLast3Months(studentId),

            };

        

            // Return the response
            ctx.send({
                DashboardAnalytics: metrics,
                RecentActivity: activities,
            });

        } catch (error) {
            console.error(error);
            ctx.throw(500, 'An error occurred while fetching overall analytics');
        }
    },

}));

// Helper function to fetch data for a given period
async function fetchDataForPeriod(studentId, startDate, endDate, projectId = null) {
    // Define the base query filters
    const filters = {
        student: studentId, // Always filter by student ID
        created_at: { $gte: startDate.toISOString(), $lt: endDate.toISOString() }, // Filter by date range
    };

    // Conditionally add the project filter if projectId is provided
    if (projectId) {
        filters.studyproject = projectId;
    }

    // Fetch data for the specified period
    return await strapi.db.query('api::questionbank.questionbank').findMany({
        where: filters, // Apply the filters
        populate: ['topics', 'assessment', 'questiontype'], // Populate related fields
    });
}

// Helper function to calculate metrics
function calculateMetrics(questionbanks, totalTopics) {
    return {
        overallGrade: calculateOverallGrade(questionbanks),
        trainingScore: calculateTrainingScore(questionbanks),
        completionRate: calculateCompletionRate(questionbanks, totalTopics),
    };
}

// Helper function to calculate change values
function calculateChangeValues(currentMetrics, previousMetrics) {
    return {
        overallGrade: calculateChange(currentMetrics.overallGrade, previousMetrics.overallGrade),
        trainingScore: calculateChange(currentMetrics.trainingScore, previousMetrics.trainingScore),
        completionRate: calculateChange(currentMetrics.completionRate, previousMetrics.completionRate),
    };
}

// Helper function to format metrics
function formatMetric(value, change, description) {
    return { value, change, description };
}

// Helper function to fetch recent activities
async function fetchRecentActivities(studentId, projectId = null) {
    // Define the base query filters
    const filters = {
        student: studentId, // Always filter by student ID
    };

    // Conditionally add the project filter if projectId is provided
    if (projectId) {
        filters.studyproject = projectId;
    }

    // Fetch recent activities
    return await strapi.db.query('api::activity.activity').findMany({
        where: filters, // Apply the filters
        select: ['id', 'entity', 'name', 'description', 'progress', 'createdAt'],
        orderBy: { createdAt: 'desc' }, // Sort by createdAt in descending order
        limit: 10, // Limit to 10 most recent activities
    });
}

// Helper function to calculate session metrics
async function calculateSessionMetrics(studentId, projectId, startDate, previousStartDate) {
    const currentAssessmentDuration = await strapi.db.query('api::marking.marking').findMany({
        where: {
            student: studentId,
            studyproject: projectId,
            created_at: { $gte: startDate.toISOString() },
        },
        select: ['sessionduration', 'duration'],
    });

    const currentTrainingDuration = await strapi.db.query('api::ai-training-session.ai-training-session').findMany({
        where: {
            student: studentId,
            studyproject: projectId,
            created_at: { $gte: startDate.toISOString() },
        },
        select: ['sessionduration', 'duration'],
    });

    const previousAssessmentDuration = await strapi.db.query('api::marking.marking').findMany({
        where: {
            student: studentId,
            studyproject: projectId,
            created_at: { $gte: previousStartDate.toISOString(), $lt: startDate.toISOString() },
        },
        select: ['sessionduration', 'duration'],
    });

    const previousTrainingDuration = await strapi.db.query('api::ai-training-session.ai-training-session').findMany({
        where: {
            student: studentId,
            studyproject: projectId,
            created_at: { $gte: previousStartDate.toISOString(), $lt: startDate.toISOString() },
        },
        select: ['sessionduration', 'duration'],
    });

    const currentStudyTime = currentAssessmentDuration.reduce((sum, session) => sum + session.sessionduration, 0) +
        currentTrainingDuration.reduce((sum, session) => sum + session.sessionduration, 0);

    const previousStudyTime = previousAssessmentDuration.reduce((sum, session) => sum + session.sessionduration, 0) +
        previousTrainingDuration.reduce((sum, session) => sum + session.sessionduration, 0);

    const currentTimelyCompletion = calculateTimelyCompletion(currentAssessmentDuration, currentTrainingDuration);
    const previousTimelyCompletion = calculateTimelyCompletion(previousAssessmentDuration, previousTrainingDuration);

    return { currentStudyTime, previousStudyTime, currentTimelyCompletion, previousTimelyCompletion };
}

// Helper function to calculate overall grade
function calculateOverallGrade(questionbanks) {
    const totalMarksAwarded = questionbanks.reduce((sum, qb) => sum + qb.marks_awarded, 0);
    const totalMaxMarks = questionbanks.reduce((sum, qb) => sum + qb.max_marks, 0);
    return totalMaxMarks === 0 ? 0 : Math.round((totalMarksAwarded / totalMaxMarks) * 100);
}

// Helper function to calculate training score
function calculateTrainingScore(questionbanks) {
    const trainingQuestions = questionbanks.filter(qb => qb.sessiontype === 'AITraining');
    const correctAnswers = trainingQuestions.reduce((sum, qb) => sum + qb.marks_awarded, 0);
    const totalMarks = trainingQuestions.reduce((sum, qb) => sum + qb.max_marks, 0);
    return totalMarks === 0 ? 0 : Math.round((correctAnswers / totalMarks) * 100);
}

// Helper function to calculate completion rate
function calculateCompletionRate(questionbanks, totalTopics) {
    const uniqueTopics = new Set(questionbanks.map(qb => qb.topicName));
    return Math.round((uniqueTopics.size / totalTopics) * 100);
}

// Helper function to calculate subject performance
function calculateSubjectPerformance(questionbanks, totalTopics) {
    const subjects = {};
    questionbanks.forEach(qb => {
        const subject = qb.subject;
        if (!subjects[subject]) {
            subjects[subject] = {
                totalMarksAwarded: 0,
                totalMaxMarks: 0,
                topicsCovered: new Set(),
            };
        }
        subjects[subject].totalMarksAwarded += qb.marks_awarded;
        subjects[subject].totalMaxMarks += qb.max_marks;
        subjects[subject].topicsCovered.add(qb.topicName);
    });

    const subjectPerformance = {};
    for (const [subject, data] of Object.entries(subjects)) {
        subjectPerformance[subject] = {
            Overall: `${Math.round((data.totalMarksAwarded / data.totalMaxMarks) * 100)}%`,
            Assessments: '88%', // Placeholder for assessment performance
            Training: '95%', // Placeholder for training performance
            Progress: `${data.topicsCovered.size}/${totalTopics} topics`,
        };
    }
    return subjectPerformance;
}

// Helper function to calculate change
function calculateChange(currentValue, previousValue) {
    if (previousValue === 0) return 0; // Avoid division by zero
    return Math.round(((currentValue - previousValue) / previousValue) * 100);
}

// Helper function to calculate timely completion
function calculateTimelyCompletion(assessmentDuration, trainingDuration) {
    const totalSessions = assessmentDuration.length + trainingDuration.length;
    const onTimeSessions = assessmentDuration.filter(session => session.sessionduration <= session.duration).length +
        trainingDuration.filter(session => session.sessionduration <= session.duration).length;
    return totalSessions === 0 ? 0 : Math.round((onTimeSessions / totalSessions) * 100);
}

// Helper function to calculate assessment analytics
function calculateAssessmentAnalytics(currentQuestionbanks, previousQuestionbanks, duration) {
    const filteredAssessments = currentQuestionbanks.filter(qb => qb.sessiontype === 'Assessment');
    const totalAssessments = filteredAssessments.length;
    const averageScore = calculateOverallGrade(currentQuestionbanks);
    const improvement = calculateChange(calculateOverallGrade(currentQuestionbanks), calculateOverallGrade(previousQuestionbanks));

    const calculateSuccessRate = (questionbanks) => {
        const totalMarksAwarded = questionbanks.reduce((sum, qb) => sum + qb.marks_awarded, 0);
        const totalMaxMarks = questionbanks.reduce((sum, qb) => sum + qb.max_marks, 0);
        return totalMaxMarks > 0 ? ((totalMarksAwarded / totalMaxMarks) * 100).toFixed(2) : 0;
    };

    const successRate = calculateSuccessRate(filteredAssessments);
    const totalAssessmentsDescription = DURATION_DESCRIPTIONS[duration] || "Total assessments in the selected period";

    const questionTypes = [...new Set(filteredAssessments.map(qb => qb.questiontype))];
    const questionTypePerformance = questionTypes.reduce((acc, type) => {
        acc[type] = {
            correct: currentQuestionbanks.filter(qb => qb.questiontype === type && qb.marks_awarded > 0).length,
            total: currentQuestionbanks.filter(qb => qb.questiontype === type).length,
        };
        return acc;
    }, {});

    return {
        TotalAssessments: {
            value: totalAssessments,
            description: totalAssessmentsDescription,
        },
        AverageScore: {
            value: `${averageScore}%`,
            description: "Overall average score",
        },
        SuccessRate: {
            value: `${successRate}%`,
            description: "Performance change from previous period",
        },
        Improvement: {
            value: `${improvement}%`,
            description: "Change in average score compared to the previous period",
        },
        QuestionTypePerformance: questionTypePerformance,
    };
}

async function getTotalProjects(studentId) {
    try {
      

        // Count the number of sessions created in the last 3 months
        const count =  await strapi.entityService.count('api::studyproject.studyproject', {
            filters: {
                student: studentId, // Filter by student ID
            },
        });

        return count;
    } catch (error) {
        console.error('Error counting sessions:', error);
        throw error;
    }
}

async function getTotalAssessmentLast3Months(studentId) {
    try {
        // Get the current date
        const currentDate = new Date();

        // Calculate the date 3 months ago
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        // Count the number of sessions created in the last 3 months
        const count =  await strapi.entityService.count('api::marking.marking', {
            filters: {
                student: studentId, // Filter by student ID
                created_at: { $gte: threeMonthsAgo.toISOString() }, // Filter by date
            },
        });

        return count;
    } catch (error) {
        console.error('Error counting sessions:', error);
        throw error;
    }
}

async function getTotalTrainingLast3Months(studentId) {
    try {
        // Get the current date
        const currentDate = new Date();

        // Calculate the date 3 months ago
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        // Count the number of sessions created in the last 3 months
        const count = await  strapi.entityService.count('api::ai-training-session.ai-training-session', {
            filters: {
                student: studentId, // Filter by student ID
                created_at: { $gte: threeMonthsAgo.toISOString() }, // Filter by date
            },
        });

        return count;
    } catch (error) {
        console.error('Error counting sessions:', error);
        throw error;
    }
}
// Helper function to calculate training analytics
function calculateTrainingAnalytics(currentQuestionbanks, previousQuestionbanks, duration) {
    const filteredCurrent = currentQuestionbanks.filter(qb => qb.sessiontype === 'AITraining');
    const filteredPrevious = previousQuestionbanks.filter(qb => qb.sessiontype === 'AITraining');

    const totalSessionsCompleted = filteredCurrent.length;

    const calculateAverageScore = (questionbanks) => {
        const totalMarks = questionbanks.reduce((sum, qb) => sum + qb.marks_awarded, 0);
        const totalPossibleMarks = questionbanks.reduce((sum, qb) => sum + qb.max_marks, 0);
        return totalPossibleMarks > 0 ? ((totalMarks / totalPossibleMarks) * 100).toFixed(2) : 0;
    };

    const averageScore = calculateAverageScore(filteredCurrent);
    const previousAverageScore = calculateAverageScore(filteredPrevious);
    const improvement = previousAverageScore > 0
        ? ((averageScore - previousAverageScore) / previousAverageScore * 100).toFixed(2)
        : 0;

    const calculateSuccessRate = (questionbanks) => {
        const totalMarksAwarded = questionbanks.reduce((sum, qb) => sum + qb.marks_awarded, 0);
        const totalMaxMarks = questionbanks.reduce((sum, qb) => sum + qb.max_marks, 0);
        return totalMaxMarks > 0 ? ((totalMarksAwarded / totalMaxMarks) * 100).toFixed(2) : 0;
    };

    const successRate = calculateSuccessRate(filteredCurrent);

    const durationDescriptions = {
        7: "AI training sessions in the past 7 days",
        30: "AI training sessions in the past 30 days",
        90: "AI training sessions in the past 90 days",
    };
    const totalSessionsDescription = durationDescriptions[duration] || "AI training sessions in the selected period";

    const difficultyLevels = [...new Set(filteredCurrent.map(qb => qb.difficulty))];
    const difficultyPerformance = difficultyLevels.reduce((acc, level) => {
        const levelData = filteredCurrent.filter(qb => qb.difficulty === level);
        const correct = levelData.filter(qb => qb.marks_awarded > 0).length;
        const total = levelData.length;
        const avgScore = total > 0 ? (levelData.reduce((sum, qb) => sum + qb.marks_awarded, 0) / levelData.reduce((sum, qb) => sum + qb.max_marks, 0) * 100).toFixed(2) : 0;

        acc[level] = {
            correct,
            total,
            averageScore: avgScore,
        };
        return acc;
    }, {});

    return {
        SessionsCompleted: {
            value: totalSessionsCompleted,
            description: totalSessionsDescription,
        },
        AverageScore: {
            value: `${averageScore}%`,
            description: "Overall average score for AI training",
        },
        Improvement: {
            value: `${improvement}%`,
            description: "Change in average score compared to the previous period",
        },
        SuccessRate: {
            value: `${successRate}%`,
            description: "Overall success rate based on marks awarded and max marks",
        },
        DifficultyPerformance: difficultyPerformance,
    };
}

// Helper function to calculate topic coverage
function calculateTopicCoverage(questionbanks, duration) {
    const subjects = [...new Set(questionbanks.map(qb => qb.subject))];
    const topicCoverage = subjects.reduce((acc, subject) => {
        const topics = [...new Set(questionbanks.filter(qb => qb.subject === subject).map(qb => qb.topicName))];
        const topicData = topics.reduce((topicAcc, topic) => {
            const topicQuestions = questionbanks.filter(qb => qb.subject === subject && qb.topicName === topic);
            const totalMarksAwarded = topicQuestions.reduce((sum, qb) => sum + qb.marks_awarded, 0);
            const totalMaxMarks = topicQuestions.reduce((sum, qb) => sum + qb.max_marks, 0);

            if (totalMaxMarks > 0) {
                topicAcc[topic] = `${((totalMarksAwarded / totalMaxMarks) * 100).toFixed(2)}%`;
            }

            return topicAcc;
        }, {});

        if (Object.keys(topicData).length > 0) {
            acc[subject] = topicData;
        }

        return acc;
    }, {});

    return topicCoverage;
}