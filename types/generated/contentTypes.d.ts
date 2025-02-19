import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiAcademicQualificationAcademicQualification
  extends Schema.CollectionType {
  collectionName: 'academic_qualifications';
  info: {
    description: '';
    displayName: 'Academic Qualification';
    pluralName: 'academic-qualifications';
    singularName: 'academic-qualification';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String;
    country: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::academic-qualification.academic-qualification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::academic-qualification.academic-qualification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAiTrainingSessionAiTrainingSession
  extends Schema.CollectionType {
  collectionName: 'ai_training_sessions';
  info: {
    description: '';
    displayName: 'AITrainingSession';
    pluralName: 'ai-training-sessions';
    singularName: 'ai-training-session';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    bestanswers: Attribute.JSON;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::ai-training-session.ai-training-session',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    difficulty: Attribute.Enumeration<['Easy', 'Medium', 'Hard']>;
    duration: Attribute.Integer;
    feedback: Attribute.Text;
    finalscore: Attribute.Integer;
    marks: Attribute.JSON;
    publishedAt: Attribute.DateTime;
    questions: Attribute.JSON;
    questions_history: Attribute.JSON;
    questiontypes: Attribute.Relation<
      'api::ai-training-session.ai-training-session',
      'oneToMany',
      'api::questiontype.questiontype'
    >;
    resources: Attribute.Relation<
      'api::ai-training-session.ai-training-session',
      'oneToMany',
      'api::resource.resource'
    >;
    status: Attribute.Enumeration<['InProgress', 'Completed', 'Abandoned']>;
    student: Attribute.Relation<
      'api::ai-training-session.ai-training-session',
      'oneToOne',
      'api::student.student'
    >;
    title: Attribute.String;
    topic: Attribute.Relation<
      'api::ai-training-session.ai-training-session',
      'oneToOne',
      'api::topic.topic'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::ai-training-session.ai-training-session',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiAssessmentAssessment extends Schema.CollectionType {
  collectionName: 'assessments';
  info: {
    description: '';
    displayName: 'Assessment';
    pluralName: 'assessments';
    singularName: 'assessment';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    academic_qualification: Attribute.Relation<
      'api::assessment.assessment',
      'oneToOne',
      'api::academic-qualification.academic-qualification'
    >;
    assessment_criteria: Attribute.JSON;
    code: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::assessment.assessment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    duration: Attribute.Integer;
    examboard: Attribute.Relation<
      'api::assessment.assessment',
      'oneToOne',
      'api::examboard.examboard'
    >;
    gradelevel: Attribute.Relation<
      'api::assessment.assessment',
      'oneToMany',
      'api::gradelevel.gradelevel'
    >;
    maxScore: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    subjects: Attribute.Relation<
      'api::assessment.assessment',
      'oneToMany',
      'api::subject.subject'
    >;
    topics: Attribute.Relation<
      'api::assessment.assessment',
      'oneToMany',
      'api::topic.topic'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::assessment.assessment',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiExamboardExamboard extends Schema.CollectionType {
  collectionName: 'examboards';
  info: {
    description: '';
    displayName: 'Examboard';
    pluralName: 'examboards';
    singularName: 'examboard';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    academic_qualification: Attribute.Relation<
      'api::examboard.examboard',
      'oneToOne',
      'api::academic-qualification.academic-qualification'
    >;
    assessmentCriteria: Attribute.JSON;
    boardName: Attribute.String;
    boardType: Attribute.Enumeration<['National', 'International', 'State']>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::examboard.examboard',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    gradelevels: Attribute.Relation<
      'api::examboard.examboard',
      'oneToMany',
      'api::gradelevel.gradelevel'
    >;
    publishedAt: Attribute.DateTime;
    subjects: Attribute.Relation<
      'api::examboard.examboard',
      'oneToMany',
      'api::subject.subject'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::examboard.examboard',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiExamtypeExamtype extends Schema.CollectionType {
  collectionName: 'examtypes';
  info: {
    description: '';
    displayName: 'Studytype';
    pluralName: 'examtypes';
    singularName: 'examtype';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::examtype.examtype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    duration: Attribute.Integer;
    format: Attribute.String;
    level: Attribute.Enumeration<
      [
        'Primary',
        'Secondary',
        'Higher Secondary',
        'College',
        'Research',
        'Work'
      ]
    >;
    name: Attribute.String;
    publishedAt: Attribute.DateTime;
    status: Attribute.Boolean & Attribute.DefaultTo<true>;
    studyboard: Attribute.Relation<
      'api::examtype.examtype',
      'oneToOne',
      'api::examboard.examboard'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::examtype.examtype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGradelevelGradelevel extends Schema.CollectionType {
  collectionName: 'gradelevels';
  info: {
    description: '';
    displayName: 'Gradelevel';
    pluralName: 'gradelevels';
    singularName: 'gradelevel';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::gradelevel.gradelevel',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    gradeName: Attribute.String;
    publishedAt: Attribute.DateTime;
    subjects: Attribute.Relation<
      'api::gradelevel.gradelevel',
      'oneToMany',
      'api::subject.subject'
    >;
    topics: Attribute.Relation<
      'api::gradelevel.gradelevel',
      'manyToMany',
      'api::topic.topic'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::gradelevel.gradelevel',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMarkingMarking extends Schema.CollectionType {
  collectionName: 'markings';
  info: {
    description: '';
    displayName: 'Marking';
    pluralName: 'markings';
    singularName: 'marking';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    assessment: Attribute.Relation<
      'api::marking.marking',
      'oneToOne',
      'api::assessment.assessment'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::marking.marking',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    feedback: Attribute.Text;
    finalscore: Attribute.Integer;
    marking: Attribute.JSON;
    marking_type: Attribute.Enumeration<['AutoMarking', 'MarkingScheme']>;
    publishedAt: Attribute.DateTime;
    resources: Attribute.Relation<
      'api::marking.marking',
      'oneToMany',
      'api::resource.resource'
    >;
    status: Attribute.Enumeration<
      [
        'InProgress',
        'Completed',
        'Abandoned',
        'MarkingInProgress',
        'MarkingCompleted',
        'MarkingFailed'
      ]
    >;
    student: Attribute.Relation<
      'api::marking.marking',
      'oneToOne',
      'api::student.student'
    >;
    submission_file: Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    submission_json: Attribute.JSON;
    title: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::marking.marking',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    workflow_name: Attribute.Relation<
      'api::marking.marking',
      'oneToOne',
      'plugin::workflow.workflow'
    >;
  };
}

export interface ApiQuestiontypeQuestiontype extends Schema.CollectionType {
  collectionName: 'questiontypes';
  info: {
    displayName: 'Questiontype';
    pluralName: 'questiontypes';
    singularName: 'questiontype';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    ai_training_session: Attribute.Relation<
      'api::questiontype.questiontype',
      'manyToOne',
      'api::ai-training-session.ai-training-session'
    >;
    code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::questiontype.questiontype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String;
    publishedAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::questiontype.questiontype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiResourceResource extends Schema.CollectionType {
  collectionName: 'resources';
  info: {
    description: '';
    displayName: 'Resource';
    pluralName: 'resources';
    singularName: 'resource';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    analysis: Attribute.JSON;
    assessment: Attribute.Relation<
      'api::resource.resource',
      'oneToOne',
      'api::assessment.assessment'
    >;
    content: Attribute.Text;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::resource.resource',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    file: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    oci_content: Attribute.JSON;
    publishedAt: Attribute.DateTime;
    resourcetype: Attribute.Relation<
      'api::resource.resource',
      'oneToOne',
      'api::resourcetype.resourcetype'
    >;
    student: Attribute.Relation<
      'api::resource.resource',
      'oneToOne',
      'api::student.student'
    >;
    title: Attribute.String;
    topic: Attribute.Relation<
      'api::resource.resource',
      'oneToOne',
      'api::topic.topic'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::resource.resource',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String;
  };
}

export interface ApiResourcetypeResourcetype extends Schema.CollectionType {
  collectionName: 'resourcetypes';
  info: {
    description: '';
    displayName: 'Resourcetype';
    pluralName: 'resourcetypes';
    singularName: 'resourcetype';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::resourcetype.resourcetype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    icon: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    name: Attribute.String;
    publishedAt: Attribute.DateTime;
    source: Attribute.Enumeration<['User', 'System']>;
    status: Attribute.Boolean & Attribute.DefaultTo<true>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::resourcetype.resourcetype',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    workflow_name: Attribute.Relation<
      'api::resourcetype.resourcetype',
      'oneToOne',
      'plugin::workflow.workflow'
    >;
  };
}

export interface ApiStudentStudent extends Schema.CollectionType {
  collectionName: 'students';
  info: {
    description: '';
    displayName: 'Student';
    pluralName: 'students';
    singularName: 'student';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    academic_qualification: Attribute.Relation<
      'api::student.student',
      'oneToOne',
      'api::academic-qualification.academic-qualification'
    >;
    bio: Attribute.Text;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::student.student',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    gradelevel: Attribute.Relation<
      'api::student.student',
      'oneToOne',
      'api::gradelevel.gradelevel'
    >;
    institution: Attribute.String;
    postcode: Attribute.String;
    publishedAt: Attribute.DateTime;
    studyboard: Attribute.Relation<
      'api::student.student',
      'oneToOne',
      'api::examboard.examboard'
    >;
    studyprojects: Attribute.Relation<
      'api::student.student',
      'oneToMany',
      'api::studyproject.studyproject'
    >;
    subjects: Attribute.Relation<
      'api::student.student',
      'oneToMany',
      'api::subject.subject'
    >;
    theme: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::student.student',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::student.student',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiStudyprojectStudyproject extends Schema.CollectionType {
  collectionName: 'studyprojects';
  info: {
    description: '';
    displayName: 'Studyproject';
    pluralName: 'studyprojects';
    singularName: 'studyproject';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    assessments: Attribute.Relation<
      'api::studyproject.studyproject',
      'oneToMany',
      'api::assessment.assessment'
    >;
    code: Attribute.UID<'api::studyproject.studyproject', 'name'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::studyproject.studyproject',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text;
    endDate: Attribute.Date;
    name: Attribute.String;
    objectives: Attribute.String;
    publishedAt: Attribute.DateTime;
    startDate: Attribute.Date;
    student: Attribute.Relation<
      'api::studyproject.studyproject',
      'manyToOne',
      'api::student.student'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::studyproject.studyproject',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSubjectSubject extends Schema.CollectionType {
  collectionName: 'subjects';
  info: {
    description: '';
    displayName: 'Subject';
    pluralName: 'subjects';
    singularName: 'subject';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::subject.subject',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String;
    publishedAt: Attribute.DateTime;
    student: Attribute.Relation<
      'api::subject.subject',
      'manyToOne',
      'api::student.student'
    >;
    tutor: Attribute.Relation<
      'api::subject.subject',
      'manyToOne',
      'api::tutor.tutor'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::subject.subject',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTopicGradeTopicGrade extends Schema.CollectionType {
  collectionName: 'topic_grades';
  info: {
    displayName: 'TopicGrade';
    pluralName: 'topic-grades';
    singularName: 'topic-grade';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    ai_training_session: Attribute.Relation<
      'api::topic-grade.topic-grade',
      'oneToOne',
      'api::ai-training-session.ai-training-session'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::topic-grade.topic-grade',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    createddate: Attribute.DateTime;
    grade: Attribute.String;
    publishedAt: Attribute.DateTime;
    topics: Attribute.Relation<
      'api::topic-grade.topic-grade',
      'manyToMany',
      'api::topic.topic'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::topic-grade.topic-grade',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTopicTopic extends Schema.CollectionType {
  collectionName: 'topics';
  info: {
    description: '';
    displayName: 'Topic';
    pluralName: 'topics';
    singularName: 'topic';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::topic.topic',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    gradelevels: Attribute.Relation<
      'api::topic.topic',
      'manyToMany',
      'api::gradelevel.gradelevel'
    >;
    group: Attribute.String;
    parent: Attribute.Relation<
      'api::topic.topic',
      'oneToOne',
      'api::topic.topic'
    >;
    publishedAt: Attribute.DateTime;
    specs: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    subject: Attribute.Relation<
      'api::topic.topic',
      'oneToOne',
      'api::subject.subject'
    >;
    title: Attribute.String;
    topic_grades: Attribute.Relation<
      'api::topic.topic',
      'manyToMany',
      'api::topic-grade.topic-grade'
    >;
    topicNumber: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::topic.topic',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String;
  };
}

export interface ApiTutorTutor extends Schema.CollectionType {
  collectionName: 'tutors';
  info: {
    description: '';
    displayName: 'Tutor';
    pluralName: 'tutors';
    singularName: 'tutor';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::tutor.tutor',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    experienceYears: Attribute.String;
    publishedAt: Attribute.DateTime;
    subjects: Attribute.Relation<
      'api::tutor.tutor',
      'oneToMany',
      'api::subject.subject'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::tutor.tutor',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::tutor.tutor',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    avatar: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    userType: Attribute.String;
  };
}

export interface PluginWorkflowTask extends Schema.CollectionType {
  collectionName: 'tasks';
  info: {
    description: '';
    displayName: 'Task';
    pluralName: 'tasks';
    singularName: 'task';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: true;
    };
    'content-type-builder': {
      visible: true;
    };
  };
  attributes: {
    config: Attribute.JSON & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::workflow.task',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    order: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    type: Attribute.Enumeration<
      [
        'Rest',
        'ChatGPT',
        'Gemini',
        'PDFProcessor',
        'Asset',
        'Echo',
        'Noop',
        'Web'
      ]
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::workflow.task',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    workflow_task_events: Attribute.Relation<
      'plugin::workflow.task',
      'oneToMany',
      'plugin::workflow.taskevent'
    >;
    workflow_task_params: Attribute.Relation<
      'plugin::workflow.task',
      'oneToMany',
      'plugin::workflow.taskparam'
    >;
  };
}

export interface PluginWorkflowTaskevent extends Schema.CollectionType {
  collectionName: 'taskevents';
  info: {
    description: '';
    displayName: 'Task Event';
    pluralName: 'taskevents';
    singularName: 'taskevent';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: true;
    };
    'content-type-builder': {
      visible: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::workflow.taskevent',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    data: Attribute.JSON;
    eventname: Attribute.String & Attribute.Required;
    publishedAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['Started', 'In-progress', 'Failed', 'Completed']
    >;
    timestamp: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::workflow.taskevent',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    workflow_task: Attribute.Relation<
      'plugin::workflow.taskevent',
      'oneToOne',
      'plugin::workflow.task'
    >;
    workflow_workflow_instance: Attribute.Relation<
      'plugin::workflow.taskevent',
      'oneToOne',
      'plugin::workflow.workflowinstance'
    >;
  };
}

export interface PluginWorkflowTaskparam extends Schema.CollectionType {
  collectionName: 'taskparams';
  info: {
    description: '';
    displayName: 'Task Param';
    pluralName: 'taskparams';
    singularName: 'taskparam';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: true;
    };
    'content-type-builder': {
      visible: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::workflow.taskparam',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 50;
      }> &
      Attribute.DefaultTo<'3'>;
    publishedAt: Attribute.DateTime;
    source: Attribute.Enumeration<
      [
        'Environment',
        'Static',
        'Input',
        'Output',
        'Param',
        'Content',
        'Options'
      ]
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::workflow.taskparam',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    value: Attribute.JSON;
  };
}

export interface PluginWorkflowWorkflow extends Schema.CollectionType {
  collectionName: 'workflows';
  info: {
    description: '';
    displayName: 'workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: true;
    };
    'content-type-builder': {
      visible: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::workflow.workflow',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String;
    publishedAt: Attribute.DateTime;
    uidata: Attribute.JSON;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::workflow.workflow',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    workflow_params: Attribute.Relation<
      'plugin::workflow.workflow',
      'oneToMany',
      'plugin::workflow.taskparam'
    >;
    workflow_tasks: Attribute.Relation<
      'plugin::workflow.workflow',
      'oneToMany',
      'plugin::workflow.task'
    >;
  };
}

export interface PluginWorkflowWorkflowinstance extends Schema.CollectionType {
  collectionName: 'workflowinstances';
  info: {
    description: '';
    displayName: 'Workflow Instance';
    pluralName: 'workflowinstances';
    singularName: 'workflowinstance';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: true;
    };
    'content-type-builder': {
      visible: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::workflow.workflowinstance',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    current_task: Attribute.Relation<
      'plugin::workflow.workflowinstance',
      'oneToOne',
      'plugin::workflow.task'
    >;
    end_time: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    runtime_state: Attribute.JSON;
    start_time: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['Started,', 'Running, ', 'Completed,', 'Failed']
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::workflow.workflowinstance',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    workflow: Attribute.Relation<
      'plugin::workflow.workflowinstance',
      'oneToOne',
      'plugin::workflow.workflow'
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::academic-qualification.academic-qualification': ApiAcademicQualificationAcademicQualification;
      'api::ai-training-session.ai-training-session': ApiAiTrainingSessionAiTrainingSession;
      'api::assessment.assessment': ApiAssessmentAssessment;
      'api::examboard.examboard': ApiExamboardExamboard;
      'api::examtype.examtype': ApiExamtypeExamtype;
      'api::gradelevel.gradelevel': ApiGradelevelGradelevel;
      'api::marking.marking': ApiMarkingMarking;
      'api::questiontype.questiontype': ApiQuestiontypeQuestiontype;
      'api::resource.resource': ApiResourceResource;
      'api::resourcetype.resourcetype': ApiResourcetypeResourcetype;
      'api::student.student': ApiStudentStudent;
      'api::studyproject.studyproject': ApiStudyprojectStudyproject;
      'api::subject.subject': ApiSubjectSubject;
      'api::topic-grade.topic-grade': ApiTopicGradeTopicGrade;
      'api::topic.topic': ApiTopicTopic;
      'api::tutor.tutor': ApiTutorTutor;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'plugin::workflow.task': PluginWorkflowTask;
      'plugin::workflow.taskevent': PluginWorkflowTaskevent;
      'plugin::workflow.taskparam': PluginWorkflowTaskparam;
      'plugin::workflow.workflow': PluginWorkflowWorkflow;
      'plugin::workflow.workflowinstance': PluginWorkflowWorkflowinstance;
    }
  }
}
