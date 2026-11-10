# Interface content patterns

The rewrites below are illustrative toolkit examples. Use them only when the product actually supports the stated behaviour.

| State | Weak wording | More useful wording | Behaviour to establish |
|---|---|---|---|
| Draft action | Submit | Save draft | Does this persist without submitting? |
| First use | Nothing here | You have no saved reports. Create a report to get started. | Can this user create reports? |
| Search | No data | No reports match this search. Try another name. | Is the result empty because of search? |
| Input error | Invalid input | Enter a date after 10 November 2026. | What boundary applies and is it inclusive? |
| Save failure | Something went wrong | We could not save your changes. Your draft is still here. Try again. | Was the draft retained and is retry safe? |
| Deletion | Are you sure? | Delete "Quarterly report"? You cannot restore it. | Is deletion irreversible? |
| Asynchronous work | Done | Your export is being prepared. | Has work merely started or finished? |

For field errors, describe the specific issue and a useful correction. GOV.UK's [error message guidance](https://design-system.service.gov.uk/components/error-message/) distinguishes input issues from service failures. Its tone choices belong to its system; transfer the clarity principles rather than treating every wording preference as universal.

For action text, consult the product's component contract. GOV.UK's [button guidance](https://design-system.service.gov.uk/components/button/) is a first-party example of matching labels to action. A clearer label cannot repair an action whose consequence is itself undefined.

For localisation, keep complete messages translatable, preserve placeholders and use the product's plural/date/number formatting. Avoid concatenating fragments whose order changes across languages. Check expansion rather than shortening every translation to fit the English layout.
