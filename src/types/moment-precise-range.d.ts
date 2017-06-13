/**
 * Type definition for the moment-precise-range Moment.js plugin.
 */

/*
 * AetheBot - A Discord Chatbot
 * 
 * Created by Tyrone Trevorrow on 13/06/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 * 
 * This source code is licensed under the permissive MIT license.
 */

import * as moment from "moment"

declare module "moment" {
    interface MomentPreciseDiff {
        (dateTo: Moment, returnsObject: true): MomentObjectOutput
        (dateTo: Moment, returnsObject?: false): string
        (dateFrom: Moment, dateTo: Moment, returnsObject: true): MomentObjectOutput
        (dateFrom: Moment, dateTo: Moment, returnsObject?: false): string
    }
    
    interface Moment {
        preciseDiff(dateTo: Moment, returnsObject: true): MomentObjectOutput
        preciseDiff(dateTo: Moment, returnsObject?: false): string
    }

    const preciseDiff: MomentPreciseDiff
}
