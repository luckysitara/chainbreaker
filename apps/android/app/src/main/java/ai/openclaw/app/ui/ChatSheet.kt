package ai.chainbreaker.app.ui

import androidx.compose.runtime.Composable
import ai.chainbreaker.app.MainViewModel
import ai.chainbreaker.app.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
