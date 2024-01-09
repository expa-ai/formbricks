import { BackButton } from "@/components/buttons/BackButton";
import SubmitButton from "@/components/buttons/SubmitButton";
import Headline from "@/components/general/Headline";
import QuestionImage from "@/components/general/QuestionImage";
import Subheader from "@/components/general/Subheader";
import { getUpdatedTtc, useTtc } from "@/lib/ttc";
import { useState } from "preact/hooks";
import { useCallback } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

import { TResponseData } from "@formbricks/types/responses";
import { TResponseTtc } from "@formbricks/types/responses";
import type { TSurveyOpenTextQuestion } from "@formbricks/types/surveys";

interface OpenTextQuestionProps {
  question: TSurveyOpenTextQuestion;
  value: string | number | string[];
  onChange: (responseData: TResponseData) => void;
  onSubmit: (data: TResponseData, ttc: TResponseTtc) => void;
  onBack: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  autoFocus?: boolean;
  ttc: TResponseTtc;
  setTtc: (ttc: TResponseTtc) => void;
}

export default function OpenTextQuestion({
  question,
  value,
  onChange,
  onSubmit,
  onBack,
  isFirstQuestion,
  isLastQuestion,
  autoFocus = true,
  ttc,
  setTtc,
}: OpenTextQuestionProps) {
  const [startTime, setStartTime] = useState(performance.now());
  const [phoneInputError, setPhoneInputError] = useState("");

  useTtc(question.id, ttc, setTtc, startTime, setStartTime);

  const handleInputChange = (inputValue: string) => {
    // const isValidInput = validateInput(inputValue, question.inputType, question.required);
    // setIsValid(isValidInput);
    onChange({ [question.id]: inputValue });
  };
  const openTextRef = useCallback(
    (currentElement: HTMLInputElement | HTMLTextAreaElement | null) => {
      if (question.id && currentElement && autoFocus) {
        currentElement.focus();
      }
    },
    [question.id, autoFocus]
  );
  const isInputEmpty = (value: string) => {
    return question.required && !value?.trim();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        //  if ( validateInput(value as string, question.inputType, question.required)) {
        if (!isValidPhoneNumber(value as string)) {
          setPhoneInputError("Invalid phone number.");

          setTimeout(() => {
            setPhoneInputError("");
          }, 3000);

          return;
        }

        const updatedttc = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
        setTtc(updatedttc);
        onSubmit({ [question.id]: value, inputType: question.inputType }, updatedttc);
        // }
      }}
      className="w-full">
      {question.imageUrl && <QuestionImage imgUrl={question.imageUrl} />}
      <Headline headline={question.headline} questionId={question.id} required={question.required} />
      <Subheader subheader={question.subheader} questionId={question.id} />
      <div className="mt-4">
        {question.inputType === "phone" ? (
          <div className="flex w-full flex-col gap-2">
            {/* @ts-expect-error */}
            <PhoneInput
              ref={openTextRef}
              tabIndex={1}
              name={question.id}
              id={question.id}
              defaultCountry="MM"
              placeholder={question.placeholder}
              /* @ts-expect-error */
              value={value}
              onChange={handleInputChange}
              required={question.required}
              autoFocus={autoFocus}
              onKeyDown={(e: any) => {
                if (e.key === "Enter" && isInputEmpty(value as string)) {
                  e.preventDefault(); // Prevent form submission
                  setPhoneInputError("Phone number is required.");
                } else if (e.key === "Enter" && !isValidPhoneNumber(value as string)) {
                  e.preventDefault();
                  setPhoneInputError("Invalid phone number.");
                  setTimeout(() => {
                    setPhoneInputError("");
                  }, 3000);
                } else if (e.key === "Enter") {
                  const updatedttc = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
                  setTtc(updatedttc);
                  onSubmit({ [question.id]: value, inputType: question.inputType }, updatedttc);
                }
              }}
              className="border-border bg-survey-bg focus:border-border-highlight w-full rounded-md border p-2 shadow-sm focus:outline-none focus:ring-0 sm:text-sm"
            />
            <div className="text-error h-5 text-sm">{phoneInputError}</div>
          </div>
        ) : question.longAnswer === false ? (
          <input
            ref={openTextRef}
            tabIndex={1}
            name={question.id}
            id={question.id}
            placeholder={question.placeholder}
            required={question.required}
            value={value ? (value as string) : ""}
            type={question.inputType}
            onInput={(e) => handleInputChange(e.currentTarget.value)}
            autoFocus={autoFocus}
            className="border-border bg-survey-bg focus:border-border-highlight block w-full rounded-md border p-2 shadow-sm focus:outline-none focus:ring-0 sm:text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && isInputEmpty(value as string)) {
                e.preventDefault(); // Prevent form submission
              } else if (e.key === "Enter") {
                const updatedttc = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
                setTtc(updatedttc);
                onSubmit({ [question.id]: value, inputType: question.inputType }, updatedttc);
              }
            }}
          />
        ) : (
          <textarea
            ref={openTextRef}
            rows={3}
            name={question.id}
            tabIndex={1}
            id={question.id}
            placeholder={question.placeholder}
            required={question.required}
            value={value as string}
            type={question.inputType}
            onInput={(e) => handleInputChange(e.currentTarget.value)}
            autoFocus={autoFocus}
            className="border-border bg-survey-bg text-subheading focus:border-border-highlight block w-full rounded-md border p-2 shadow-sm focus:ring-0 sm:text-sm"
          />
        )}
      </div>

      <div className="mt-4 flex w-full justify-between">
        {!isFirstQuestion && (
          <BackButton
            backButtonLabel={question.backButtonLabel}
            onClick={() => {
              const updatedttc = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
              setTtc(updatedttc);
              onBack();
            }}
          />
        )}
        <div></div>
        <SubmitButton buttonLabel={question.buttonLabel} isLastQuestion={isLastQuestion} onClick={() => {}} />
      </div>
    </form>
  );
}
